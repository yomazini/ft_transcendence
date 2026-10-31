import os
import bullmq as bmq
import scraper_svc.globals as g
from typing import Any, cast
from scraper_svc.helpers import get_job, add_job, update_job_status, BadJobError
from scraper_svc.models import Jobstatuses

DATABASE_QUEUE=os.getenv('DATABASE_QUEUE','database-job')
ANALYSIS_QUEUE=os.getenv("ANALYSIS_QUEUE", 'analyze-job')

class DatabaseWorker:
	worker: bmq.Worker
	queue: bmq.Queue

	def __init__(self) -> None:
		self.log("Setting up workers")
		worker_num: int = g.settings.get_worker_num()
		self.worker = bmq.Worker(
			DATABASE_QUEUE,
			cast(Any, self.insert),
			{
				'concurrency': worker_num if worker_num < g.MAX_WORKER else g.MAX_WORKER,
				'connection': g.REDIS_URL,
				'autorun': False
			}
		)
		self.queue = bmq.Queue(
			ANALYSIS_QUEUE,
			{'connection': g.REDIS_URL}
		)

	async def insert(self, job: bmq.Job, token: str):
		data = job.data
		try:
			scraped_data = data["data"]
			job_data = get_job(data["id"])
			self.log(f'Received Job {job_data.id} type {job_data.mode}')
			add_job(job_data.id, scraped_data, job_data.mode)
			self.log(f'Sending {job_data.id} to analysis-svc')
			g.scraper_jobs_total.labels("done").inc()
			await self.queue.add(
				"analysis",
				{'id': job_data.id},
				{
					'attempts': 3,
					'backoff': {
						'type': 'exponential',
						'delay': 2000,
					}
				}
			)
			
		except BadJobError as bje:
			g.logger.warning(
				"Insertion job: job [%s] doesn't exist",
				data.get("id", None)
			)
			g.scraper_jobs_total.labels("failed").inc()
			raise bmq.UnrecoverableError(str(bje))
		
		except Exception as exc:
			attempts = job.attemptsMade
			max_attempts = job.opts.get("attempts", 1) - 1
			g.logger.warning(
				"Insertion job: [%s] error_name=%s reason=%s retries=%d",
				data.get("id", None),
				type(exc).__name__,
				exc,
				max_attempts - attempts
			)

			if attempts >= max_attempts:
				g.scraper_jobs_total.labels("failed").inc()
				await update_job_status(data.get("id", "None"), Jobstatuses.FAILED, str(exc))
			raise

	def log(self, msg: str):
		g.logger.info("insertion worker: %s", msg)

	async def stop(self):
		await self.worker.close()
		await self.queue.close()
	
	async def start(self):
		self.log(f"Service is ready for jobs")
		await self.worker.run()