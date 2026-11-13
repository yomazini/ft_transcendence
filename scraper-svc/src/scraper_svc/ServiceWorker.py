import os, asyncio
import bullmq as bmq
import scraper_svc.globals as g
from typing import cast, Any
from uuid import uuid4
from sqlalchemy.orm import Session
from sqlalchemy import select,exists, update, delete
from scraper_svc.models import Job, Jobstatuses, Jobmodes, SubJob
from scraper_svc.helpers import insert_comments, get_job, get_subjob, scrape, get_scrape_target, valid_post_url, update_job_status, normalize_data,RateLimitError,WorkerState, SessionError

SCRAPE_QUEUE=os.getenv('SCRAPE_QUEUE','scrape-job')
ANALYSIS_QUEUE=os.getenv("ANALYSIS_QUEUE", 'analyze-job')

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
			"state": self.state.value
		}

class ServiceWorker:
	worker: bmq.Worker
	queue: bmq.Queue

	def __init__(self):
		self.log("Setting up workers")

		worker_num: int = g.settings.get_worker_num()
		self.worker = bmq.Worker(
			SCRAPE_QUEUE,
			cast(Any, self.run_pipeline),
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

	def validate_job(self, job_id: str) -> Session:
		session: Session = g.db.get_session()
		result = session.scalar(
			select(exists().where(Job.id == job_id))
		)
		if result:
			return session
		session.close()
		raise SessionError("invalid job id")


	async def run_pipeline(self, job:bmq.Job, token:str):
		actions = [self.scrape, self.create_subjobs, self.scrape_subjob, self.save_subjobs, self.insert_bulk]
		job_data = WorkerData(job.data.get("id", "missing"), job.data.get("data", None), job.data.get("state", WorkerState.SCRAPE))
		try:
			job_data.session = self.validate_job(job_data.job_id)
			await update_job_status(job_data.session, job_data.job_id, Jobstatuses.SCRAPING.value)
			i = job_data.state
			while (i < WorkerState.DONE):
				i = await actions[i.value](job_data)
				job_data.state = i
				await job.updateData(job_data.to_dict())
			self.log(f"Job {job_data.job_id} Done")
			
			await self.queue.add("analyze", {'id': job_data.job_id})
		except SessionError as se:
			g.logger.error("Scrape worker: %s", se)
		except RateLimitError as rle:
			g.logger.warning("Scrape worker: %s", rle)
		except Exception as e:
			g.logger.error("Scrape worker: %s", e)
			await update_job_status(job_data.session, job_data.job_id, Jobstatuses.FAILED.value, str(e))
			raise bmq.UnrecoverableError(str(e)) from e
		finally:
			if job_data.session:
				self.log(f"closed database session")
				job_data.session.close()

	async def scrape(self, data: WorkerData) -> WorkerState:
		self.log(f"Scraping job {data.job_id}")
		job = get_job(data.session, data.job_id)
		if job.mode == Jobmodes.POST:
			valid_post_url(job.target)
			data.data = [job.target]
			return WorkerState.CREATE_SUBJOBS
		result = await asyncio.to_thread(scrape, *get_scrape_target(job.target, job.mode))
		data.data = normalize_data(result, job.mode)
		return WorkerState.CREATE_SUBJOBS

	async def create_subjobs(self, data: WorkerData) -> WorkerState:
		if (not isinstance(data.data, list)):
			raise RuntimeError("Impossible action error")
		last_id: str| None = None
		self.log(f"Create SubJobs for {data.job_id}")
		for post in data.data[::-1]:
			job = SubJob(
				id=str(uuid4()),
				job_id=data.job_id,
				url=post,
				nex_id=last_id,
				data=None
			)
			data.session.add(job)
			last_id = job.id
		data.session.commit()
		data.data = {"id": last_id}
		return WorkerState.SCRAPE_SUBJOB

	async def scrape_subjob(self, data: WorkerData) -> WorkerState:
		if (not isinstance(data.data, dict)):
			raise RuntimeError("Impossible action error")
		subjob_id = data.data.get("id", "missing")
		self.log(f"Scrape SubJob {subjob_id}")
		job = get_subjob(data.session, subjob_id)
		url = valid_post_url(job.url)
		result = await asyncio.to_thread(scrape, url, {})
		data.data["data"] = normalize_data(result, Jobmodes.POST)
		return WorkerState.SAVE_NORM_DATA

	async def save_subjobs(self, data: WorkerData) -> WorkerState:
		if (not isinstance(data.data, dict)):
			raise RuntimeError("Impossible action error")
		subjob_id = data.data.get("id", "missing")
		self.log(f"Save SubJob {subjob_id} data")
		next_id = data.session.execute(
			update(SubJob)
			.where(SubJob.id == subjob_id)
			.values(data=data.data["data"])
			.returning(SubJob.nex_id)
		).scalar_one()
		data.session.commit()
		if next_id:
			data.data = {"id": next_id}
			return WorkerState.SCRAPE_SUBJOB
		data.data = None
		return WorkerState.INSERT_BULK


	async def insert_bulk(self, data: WorkerData) -> WorkerState:
		self.log(f"Start inserting {data.job_id} job")
		ids: list[str] = data.session.execute(
			select(SubJob.id)
			.where(SubJob.job_id == data.job_id)
		).scalars().all()
		for sjob_id in ids:
			job_data = data.session.execute(
				select(SubJob.data).where(SubJob.id == sjob_id)
			).scalar_one()
			if job_data is None:
				continue
			insert_comments(data.session, data.job_id, None, job_data)
		data.session.execute(
			delete(SubJob).where(SubJob.job_id == data.job_id)
		)
		data.session.commit()
		return WorkerState.DONE

	def log(self, msg: str):
		g.logger.info("scrape worker: %s", msg)

	async def stop(self):
		await self.worker.close()
		await self.queue.close()
	
	async def start(self):
		self.log(f"Service is ready for jobs")
		await self.worker.run()

	