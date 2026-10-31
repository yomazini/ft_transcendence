import os, asyncio
import scraper_svc.globals as g
import bullmq as bmq
from typing import Any, cast
from scraper_svc.helpers import scrape_job, get_job, update_job_status, RateLimitError
from scraper_svc.models import Job, Jobstatuses


JOB_QUEUE=os.getenv('JOB_QUEUE','scrape-job')
DATABASE_QUEUE=os.getenv("DATABASE_QUEUE", 'database-job')

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
				'concurrency': worker_num if worker_num < g.MAX_WORKER else g.MAX_WORKER,
				'connection': g.REDIS_URL,
				'autorun': False
			}
		)
		self.queue = bmq.Queue(
			DATABASE_QUEUE,
			{'connection': g.REDIS_URL}
		)		

	async def scrape(self, job: bmq.Job, token: str) -> None:
		data = job.data
		# data["mode"] = str(data["mode"]).capitalize()
		try:
			job_data = get_job(data["id"])
			self.log(f'Received Job {job_data.id} type {job_data.mode}')
			await update_job_status(job_data.id, Jobstatuses.RUNNING, None)
			body = await asyncio.to_thread(scrape_job, job_data.target, job_data.mode)
			self.log(f'Sending {job_data.id} to database-job')
			await self.queue.add(
				"database",
				{
					'id': job_data.id,
					'data': body
				},
				{
					'attempts': 3,
					'backoff': {
						'type': "fixed",
						'delay': 2000
					}
				}
			)

		except RateLimitError as exc:
			attempts = job.attemptsMade
			max_attempts = job.opts.get("attempts", 1) - 1
			
			if attempts >= max_attempts:
				g.logger.warning("Scrape Worker: job [%s] reason=Too many retries", data["id"])
				g.scraper_jobs_total.labels("failed").inc()
				await update_job_status(data["id"], Jobstatuses.FAILED, str(exc))
			else:
				g.logger.warning(
					"Scrape Worker: job [%s] rate limited, retries left (%d)",
					data["id"],
					max_attempts - attempts
				)
			raise

		except Exception as exc:
			job_id = data.get("id" , None)
			g.logger.warning(
				"Scrape Worker: failed permanently [%s] error_name=%s reason=%s",
				job_id,
				type(exc).__name__,
				exc
			)
			g.scraper_jobs_total.labels("failed").inc()
			if job_id:
				await update_job_status(job_id, Jobstatuses.FAILED, str(exc))
			raise bmq.UnrecoverableError(str(exc)) from exc

	def log(self, msg: str):
		g.logger.info("Scrape worker: %s", msg)

	async def stop(self):
		await self.worker.close()
		await self.queue.close()

	async def start(self):
		self.log(f"Service is ready for jobs")
		await self.worker.run()