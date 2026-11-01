import json
import redis.asyncio as pub_channel
import scraper_svc.globals as g
from scraper_svc.models import Job

EVENT_CHANNEL="job-events"

class EventManager:
	_channel: pub_channel.Redis

	def __init__(self) -> None:
		self._channel = pub_channel.from_url(g.REDIS_URL, decode_responses=True)

	async def publish(self, job_id: str, job_status: str, error: str | None):
		self._log(f"Published status {job_status} for Job <{job_id}>")
		await self._channel.publish(EVENT_CHANNEL, json.dumps({
			'job_id': job_id,
			'status': job_status.lower(),
			'error': error
		}))

	def _log(self, msg:str):
		g.logger.info("Event Manager: %s", msg)

	async def close(self):
		await self._channel.aclose()

