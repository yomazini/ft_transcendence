import os, json
from bullmq import Queue, Worker, Job
from typing import Any, cast
from collections.abc import Callable
from scraper_svc.scrapers import scrape_mode
from scraper_svc.Settings import Settings
from scraper_svc.models import Jobmodes
from scraper_svc.Database import Database
from asyncio import Future
from uuid import UUID

REDIS_URL = f"redis://{os.getenv('REDIS_HOST', 'redis')}:{os.getenv('REDIS_PORT', '6379')}"
JOB_QUEUE=os.getenv('JOB_QUEUE','scrape-job')
ANALYSIS_QUEUE=os.getenv("ANALYSIS_QUEUE", 'analyze-job')



class ScrapingWorker:
    settings: Settings
    db: Database | None
    worker: Worker | None
    queue: Queue | None

    def __init__(self):
        self.settings = Settings()
        self.db = None
        self.worker = None
        self.queue = None

    async def scrape(self, job: Job, token: str) -> None:
        try:
            print("started", flush=True)
            data = job.data
            id: UUID = UUID(data["id"])
            mode_str: str = data["mode"]
            mode: Jobmodes = Jobmodes(mode_str.capitalize())
            target: str = data["target"]
            body = scrape_mode(self.settings.sessions[0], target, mode)
            if self.db is None:
                raise RuntimeError("Database not found")
            self.db.add(str(id), body, mode)
        except Exception as e:
            print(e, flush=True)

    async def start(self):
        await self.settings.init_settings()
        url = self.settings.url
        if url is None:
            raise RuntimeError("Database URL was not configured")
        self.db = Database(url)
        self.worker = Worker(JOB_QUEUE, cast(Callable[..., Future[Any]], self.scrape), {'connection': REDIS_URL, 'autorun': False})
        self.queue = Queue(ANALYSIS_QUEUE, {'connection': REDIS_URL})
        await self.worker.run()