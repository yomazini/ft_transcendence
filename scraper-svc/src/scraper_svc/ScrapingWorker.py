import os, asyncio
import scraper_svc.globals as g
from uuid import UUID
import bullmq as bmq
from typing import Any, cast
from scraper_svc.helpers import scrape_job, add_job, RateLimitError
from scraper_svc.models import Jobmodes, Job

REDIS_URL = f"redis://{os.getenv('REDIS_HOST', 'redis')}:{os.getenv('REDIS_PORT', '6379')}"
JOB_QUEUE=os.getenv('JOB_QUEUE','scrape-job')
ANALYSIS_QUEUE=os.getenv("ANALYSIS_QUEUE", 'analyze-job')
MAX_WORKER=5

class ScrapingWorker:
	worker: bmq.Worker
	queue: bmq.Queue

	def __init__(self):
		self.log("Setting up workers")

		worker_num: int = g.settings.get_worker_num()
		self.worker = bmq.Worker(
			JOB_QUEUE,
			cast(Any, self.scrape),
			{
				'concurrency': worker_num if worker_num < MAX_WORKER else MAX_WORKER,
				'connection': REDIS_URL,
				'autorun': False
			}
		)
		self.queue = bmq.Queue(
			ANALYSIS_QUEUE,
			{'connection': REDIS_URL}
		)		

	async def scrape(self, job: bmq.Job, token: str) -> None:
		data = job.data
		try:
			data["mode"] = str(data["mode"]).capitalize()
			job_data = Job(**data)
			self.log(f'Received Job {job_data.id} type {data["mode"]}')
			body = await asyncio.to_thread(scrape_job, job_data.target, job_data.mode)
			add_job(str(job_data.id), body, job_data.mode)
			self.log(f"Scraping Job {job_data.id} complete")
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
				"Scrape Worker: failed permanently job_id=%s reason=%s",
				data.get("id", "<missing>"),
				exc
			)
			raise bmq.UnrecoverableError(str(exc)) from exc

	def log(self, msg: str):
		g.logger.info("Scrape worker: %s", msg)

	async def start(self):
		self.log(f"Service is ready for jobs")
		await self.worker.run()