import asyncio, json, os, logging
from bullmq import Queue, Worker, Job
import redis.asyncio as aioredis
from scraper_svc.scrapers import scrape_mode

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("scraper-worker")

REDIS_URL = f"redis://{os.getenv('REDIS_HOST', 'redis')}:{os.getenv('REDIS_PORT', '6379')}"
SCRAPE_QUEUE = os.getenv('SCRAPE_QUEUE', 'scrape-job')      # filled by gateway-svc
ANALYZE_QUEUE = os.getenv('ANALYZE_QUEUE', 'analyze-job')   # read by analysis-svc
EVENTS_CHANNEL = os.getenv('EVENTS_CHANNEL', 'job-events')  # relayed to the browser by gateway-svc

class ScrapingWorker:
    def __init__(self):
        #TODO! create a session handler.
        # A Reddit session cookie is optional: public JSON pages work without one.
        sessions = os.getenv('SESSION_IDS') or os.getenv('REDDIT_SESSIONS') or ''
        self.session_ids = [s for s in sessions.split(',') if s and s != 'changeme']
        self.worker = None
        self.queue = None
        self.events = None

    async def scrape(self, job: Job, token: str) -> dict:
        data = job.data
        job_id = data.get('id')
        session_id = self.session_ids[0] if self.session_ids else None
        logger.info("Scraping job %s (%s %s)", job_id, data.get('mode'), data.get('target'))
        try:
            # requests is blocking: run it in a thread so the event loop stays free.
            comments = await asyncio.to_thread(scrape_mode, session_id, data['target'], mode=data['mode'])
        except Exception as e:
            logger.error("Scraping failed for job %s: %s", job_id, e)
            # BullMQ retries the job (attempts set by gateway-svc): report the failure only after the last try.
            if job.attemptsMade + 1 >= int((job.opts or {}).get('attempts', 1)):
                await self.events.publish(EVENTS_CHANNEL, json.dumps({
                    'job_id': job_id, 'status': 'failed', 'error': f'scraping failed: {e}',
                }))
            raise
        logger.info("Job %s: %d comments, sending to %s", job_id, len(comments), ANALYZE_QUEUE)
        await self.queue.add('analyze', {**data, 'comments': comments})
        return {'job_id': job_id, 'comments': len(comments)}

    async def start(self):
        self.queue = Queue(ANALYZE_QUEUE, {'connection': REDIS_URL})
        self.events = aioredis.from_url(REDIS_URL, decode_responses=True)
        self.worker = Worker(SCRAPE_QUEUE, self.scrape, {'connection': REDIS_URL, 'autorun': False})
        logger.info("Listening on %s, forwarding to %s", SCRAPE_QUEUE, ANALYZE_QUEUE)
        await self.worker.run()
