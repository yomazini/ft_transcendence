import os, logging
from bullmq import Queue, Worker, Job, UnrecoverableError
from scraper_svc.RateLimitError import RateLimitError
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
		data = job.data
		try:
			job_id: UUID = UUID(data["id"])
			mode_str: str = data["mode"]
			mode: Jobmodes = Jobmodes(mode_str.capitalize())
			target: str = data["target"]
			logging.getLogger("scraper-svc").info(f"Received Job {job_id} type {data["mode"]}")
			body = scrape_mode(self.settings.sessions[0], target, mode)
			if self.db is None:
				raise RuntimeError("Database not found")
			self.db.add(str(job_id), body, mode)
			if self.queue is None:
				raise RuntimeError("BullMQ queue is not initialized")
			logging.getLogger("scraper-svc").info(f"Scraping Job {job_id} complete")
			await self.queue.add("analyze", data)
		except RateLimitError as exc:
			logging.getLogger("scraper-svc").warning(
				"Job rate limited job_id=%s reason=%s",
				data.get("id", "<missing>"),
				exc,
			)
			raise
		except Exception as exc:
			logging.getLogger("scraper-svc").exception(
				"Job failed permanently job_id=%s",
				data.get("id", "<missing>"),
			)
			raise UnrecoverableError(str(exc)) from exc

	async def start(self):
		await self.settings.init_settings()
		url = self.settings.url
		if url is None:
			raise RuntimeError("Database URL was not configured")
		logging.getLogger("scraper-svc").info(f"Setting up the service")
		self.db = Database(url)
		self.worker = Worker(JOB_QUEUE, cast(Callable[..., Future[Any]], self.scrape), {'connection': REDIS_URL, 'autorun': False})
		self.queue = Queue(ANALYSIS_QUEUE, {'connection': REDIS_URL})
		logging.getLogger("scraper-svc").info(f"Service is ready for jobs")
		await self.worker.run()