import os
import scraper_svc.globals as g
from uuid import UUID
from bullmq import Queue, Worker, Job, UnrecoverableError
from typing import Any, cast
from scraper_svc.helpers import scrape_job, add_job, RateLimitError
from scraper_svc.models import Jobmodes

REDIS_URL = f"redis://{os.getenv('REDIS_HOST', 'redis')}:{os.getenv('REDIS_PORT', '6379')}"
JOB_QUEUE=os.getenv('JOB_QUEUE','scrape-job')
ANALYSIS_QUEUE=os.getenv("ANALYSIS_QUEUE", 'analyze-job')

class ScrapingWorker:
	worker: Worker
	queue: Queue

	def __init__(self):
		self.log("Setting up workers")
		self.worker = Worker(JOB_QUEUE, cast(Any, self.scrape), {'connection': REDIS_URL, 'autorun': False})
		self.queue = Queue(ANALYSIS_QUEUE, {'connection': REDIS_URL})

	async def scrape(self, job: Job, token: str) -> None:
		data = job.data
		try:
			job_id: UUID = UUID(data["id"])
			mode_str: str = data["mode"]
			mode: Jobmodes = Jobmodes(mode_str.capitalize())
			target: str = data["target"]
			self.log(f'Received Job {job_id} type {data["mode"]}')
			body = scrape_job(g.settings.get_sessions()[0], target, mode)
			add_job(str(job_id), body, mode)
			self.log(f"Scraping Job {job_id} complete")
			await self.queue.add("analyze", data)

		except RateLimitError as exc:
			g.logger.warning(
				"Scrape Worker: job rate limited job_id=[%s] reason=%s",
				data.get("id", "<missing>"),
				exc,
			)
			raise

		except Exception as exc:
			g.logger.warning(
				"Scrape Worker: failed permanently job_id=%s",
				data.get("id", "<missing>"),
			)
			raise UnrecoverableError(str(exc)) from exc

	def log(self, msg: str):
		g.logger.info("Scrape worker: %s", msg)

	async def start(self):
		self.log(f"Service is ready for jobs")
		await self.worker.run()