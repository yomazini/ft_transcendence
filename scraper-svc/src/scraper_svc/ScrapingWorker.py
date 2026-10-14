import os, json
from bullmq import Queue, Worker, Job
from scraper_svc.scrapers import scrape_mode

class ScrapingWorker:
    def __init__(self):
        #TODO! create a session handler.
        self.session_ids = os.getenv('SESSION_IDS').split(',')

        self.worker = Worker('scrape-job', self.scrape)

        #TODO! implement a job crator
        self.queue = Queue('gateway-job')

    async def scrape(self, job: Job, token: str) -> None:
        #TODO! Better scraping
        data = job.data
        response = scrape_mode(self.session_ids[0], data['target'], mode=data['mode'])
        print(json.dumps(response.json()), ', ')

    async def start(self):
        await self.worker.run()
