import os, time
import bullmq as bmq
import scraper_svc.globals as g
from typing import cast, Any
from uuid import uuid4
from sqlalchemy.orm import Session
from sqlalchemy import select,exists, update, delete
from scraper_svc.models import Job, Jobstatuses, Jobmodes, SubJob
from scraper_svc.helpers import (
	insert_comments,
	get_job,
	get_subjob,
	scrape,get_scrape_target,
	valid_post_url,
	update_job_status,
	normalize_post,
	normalize_posts,
	safe_update_job_status,
	safe_rollback,
	safe_cleanup,
	WorkerState,
	BadJobError
)

SCRAPE_QUEUE=os.getenv('SCRAPE_QUEUE','scrape-job')
ANALYSIS_QUEUE=os.getenv("ANALYSIS_QUEUE", 'analyze-job')
COMMENTS_LIMIT=os.getenv('COMMENTS_LIMIT', "0")

class WorkerData:
	session: Session | None
	job_id:str
	data: list | dict | None
	state: WorkerState

	def __init__(self, job_id: str, data: list | dict | None, state: WorkerState):
		self.job_id = job_id
		self.data = data
		self.state = state
		self.session = None

	def to_dict(self):
		return {
			"id": self.job_id,
			"data": self.data,
			"state": self.state.value,
		}

class ServiceWorker:
	worker: bmq.Worker
	queue: bmq.Queue

	def __init__(self):
		self.log("Setting up workers")

		self.worker = bmq.Worker(
			SCRAPE_QUEUE,
			cast(Any, self.run_pipeline),
			{
				'concurrency': max(1, min(g.session.get_workers(), int(g.MAX_WORKER))),
				'connection': g.REDIS_URL,
				'autorun': False
			}
		)
		self.queue = bmq.Queue(
			ANALYSIS_QUEUE,
			{'connection': g.REDIS_URL}
		)	

	def validate_job(self, job_data: WorkerData):
		job_data.session = g.db.get_session()
		result = job_data.session.scalar(
			select(exists().where(Job.id == job_data.job_id))
		)
		if result:
			return
		raise BadJobError("invalid job id")


	async def run_pipeline(self, job:bmq.Job, token:str):
		actions = [self.scrape, self.create_subjobs, self.scrape_subjob, self.save_subjobs, self.insert_bulk]
		mode = "unknown"
		started_at = time.monotonic()
		job_data = WorkerData(job.data.get("id", "missing"), job.data.get("data", None), WorkerState(job.data.get("state", WorkerState.SCRAPE)))
		g.scraper_jobs_in_progress.inc()
	
		try:

			self.validate_job(job_data)
			await update_job_status(job_data.session, job_data.job_id, Jobstatuses.SCRAPING.value)
			mode = get_job(job_data.session, job_data.job_id).mode.value

			i = job_data.state
			while (i < WorkerState.DONE):
				i = await actions[i.value](job_data)
				job_data.state = i
				await job.updateData(job_data.to_dict())
			self.log(f"Job {job_data.job_id} Done")

			await self.queue.add("analyze", {'id': job_data.job_id})
			g.scraper_jobs_total.labels("done").inc()

		except BadJobError as bje:
			safe_rollback(job_data.session)
			
			g.logger.error("Scrape worker: %s", bje)
			g.scraper_jobs_total.labels("failed").inc()
			if job_data.session:
				await safe_update_job_status(job_data.session, job_data.job_id, Jobstatuses.FAILED.value, str(bje).splitlines()[0])
			raise bmq.UnrecoverableError(str(bje)) from bje

		except Exception as e:
			safe_rollback(job_data.session)
			attempts = job.attemptsMade
			max_attempts = job.opts.get("attempts", 1) - 1
			g.logger.warning(
				"Scrape worker: [%s] reason=%s retries=%d",
				job_data.job_id,
				e,
				max_attempts - attempts
			)
			if attempts >= max_attempts:
				g.scraper_jobs_total.labels("failed").inc()
				if job_data.session:
					await safe_update_job_status(job_data.session, job_data.job_id, Jobstatuses.FAILED.value, str(e).splitlines()[0])
			raise

		finally:
			g.scraper_jobs_in_progress.dec()
			g.scraper_job_duration_seconds.labels(mode).observe(
        		time.monotonic() - started_at
			)
			try:
				await job.updateData(job_data.to_dict())
			except:
				pass
			if job_data.session:
				self.log(f"closed database session")
				safe_cleanup(job_data.session)

	async def scrape(self, data: WorkerData) -> WorkerState:
		if (data.session == None):
			raise RuntimeError("Impossible action error")

		self.log(f"Scraping job {data.job_id}")
		job = get_job(data.session, data.job_id)

		if job.mode == Jobmodes.POST:
			valid_post_url(job.target)
			data.data = [job.target]
			return WorkerState.CREATE_SUBJOBS
		result = await scrape(*get_scrape_target(job.target, job.mode))
		data.data = normalize_posts(result)
		return WorkerState.CREATE_SUBJOBS

	async def create_subjobs(self, data: WorkerData) -> WorkerState:
		if (not isinstance(data.data, list) or data.session == None):
			raise RuntimeError("Impossible action error")
		last_id: str| None = None
		self.log(f"Create SubJobs for {data.job_id}")
		for post in data.data[::-1]:
			job = SubJob(
				id=str(uuid4()),
				job_id=data.job_id,
				url=post,
				next_id=last_id,
				data=None
			)
			data.session.add(job)
			last_id = job.id
		data.session.commit()
		data.data = {"id": last_id}
		return WorkerState.SCRAPE_SUBJOB

	async def scrape_subjob(self, data: WorkerData) -> WorkerState:
		if (not isinstance(data.data, dict) or data.session == None):
			raise RuntimeError("Impossible action error")
		subjob_id = data.data.get("id", "missing")
		self.log(f"Scrape SubJob {subjob_id}")
		job = get_subjob(data.session, subjob_id)
		url = valid_post_url(job.url)
		result = await scrape(url, {'limit': int(COMMENTS_LIMIT)})
		data.data["data"] = normalize_post(result)
		return WorkerState.SAVE_NORM_DATA

	async def save_subjobs(self, data: WorkerData) -> WorkerState:
		if (not isinstance(data.data, dict) or data.session == None):
			raise RuntimeError("Impossible action error")
		subjob_id = data.data.get("id", "missing")
		self.log(f"Save SubJob {subjob_id} data")
		next_id = data.session.execute(
			update(SubJob)
			.where(SubJob.id == subjob_id)
			.values(data=data.data["data"])
			.returning(SubJob.next_id)
		).scalar_one()
		data.session.commit()
		if next_id:
			data.data = {"id": next_id}
			return WorkerState.SCRAPE_SUBJOB
		data.data = None
		return WorkerState.INSERT_BULK


	async def insert_bulk(self, data: WorkerData) -> WorkerState:
		if (data.session == None):
			raise RuntimeError("Impossible action error")
		comment_count = 0
		self.log(f"Start inserting {data.job_id} job")
		ids = data.session.execute(
			select(SubJob.id)
			.where(SubJob.job_id == data.job_id)
		).scalars().all()
		for sjob_id in ids:
			job_data = data.session.execute(
				select(SubJob.data).where(SubJob.id == sjob_id)
			).scalar_one()
			if job_data is None:
				continue
			comment_count += insert_comments(data.session, data.job_id, None, cast(dict, job_data))
		data.session.execute(
			delete(SubJob).where(SubJob.job_id == data.job_id)
		)
		data.session.commit()
		g.scraper_comments_total.inc(comment_count)
		return WorkerState.DONE

	def log(self, msg: str):
		g.logger.info("Scrape worker: %s", msg)

	async def stop(self):
		await self.worker.close()
		await self.queue.close()
	
	async def start(self):
		self.log(f"Service is ready for jobs")
		await self.worker.run()

	