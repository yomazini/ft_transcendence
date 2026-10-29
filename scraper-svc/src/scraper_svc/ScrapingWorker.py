import os, asyncio
import scraper_svc.globals as g
import bullmq as bmq
from typing import Any, cast
from scraper_svc.helpers import scrape_job, add_job, update_job_status, RateLimitError
from scraper_svc.models import Job, Jobstatuses


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
				'connection': g.REDIS_URL,
				'autorun': False
			}
		)
		self.queue = bmq.Queue(
			ANALYSIS_QUEUE,
			{'connection': g.REDIS_URL}
		)		

	async def scrape(self, job: bmq.Job, token: str) -> None:
		data = job.data
		data["mode"] = str(data["mode"]).capitalize()
		try:
			job_data = Job(**data)
			self.log(f'Received Job {job_data.id} type {data["mode"]}')
			await update_job_status(job_data.id, Jobstatuses.RUNNING, None)
			body = await asyncio.to_thread(scrape_job, job_data.target, job_data.mode)
			add_job(str(job_data.id), body, job_data.mode)
			self.log(f"Scraping Job {job_data.id} complete")
			await self.queue.add("analyze", data)

		except RateLimitError as exc:
			g.logger.warning(
				"Scrape Worker: job rate limited job_id=[%s] reason=%s",
				data["id"],
				exc,
			)
			if job.attemptsMade >= job.opts.get("attempts", 1) - 1:
				await update_job_status(data["id"], Jobstatuses.FAILED, str(exc))
			raise

		except Exception as exc:
			job_id = data.get("id" , None)
			g.logger.warning(
				"Scrape Worker: failed permanently job_id=%s reason=%s",
				job_id,
				exc
			)
			if job_id is not None:
				await update_job_status(job_id, Jobstatuses.FAILED, str(exc))
			raise bmq.UnrecoverableError(str(exc)) from exc

	def log(self, msg: str):
		g.logger.info("Scrape worker: %s", msg)

	async def start(self):
		self.log(f"Service is ready for jobs")
		await self.worker.run()