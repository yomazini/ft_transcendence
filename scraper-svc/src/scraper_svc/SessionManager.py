import asyncio
import scraper_svc.globals as g
from curl_cffi import requests, Response
from time import sleep, monotonic
from threading import Lock

HEADERS = {
	"User-Agent": "linux:ft-transcendence-scraper:v0.1",
	"Accept": "application/json",
}

class SessionManager:
	_initialized: bool = False
	_use_api: bool = False
	_client_id: str = ""
	_secret_id: str = ""
	_api_token: str = ""
	_created_token_at: float = 0.0
	_expires: float = 0.0
	_session: str = ""
	_reserved: int = 0
	_consumed: float = 0.0
	_left: float = 0.0
	_deadline: float = 0.0
	_lock = Lock()

	def init_session_manager(self):
		self._use_api = False
		self._session = g.settings.get_session()
		self._deadline = monotonic()
		self._initialized = True

	async def reserve(self):
		await asyncio.to_thread(self._reserve)

	def _reserve(self):
		while(True):
			sleep_time = 0.0
			with self._lock:
				sleep_time = self._deadline - monotonic()
				if (sleep_time <= 1 and self._reserved == 0) or self._left > self._reserved + 1:
					self._reserved += 1
					break
			sleep(max(1, sleep_time))

	async def release(self):
		await asyncio.to_thread(self._release)

	def _release(self):
		with self._lock:
			self._reserved -= 1



	async def send_request(self, path: str, query: dict) -> Response:
		return await asyncio.to_thread(self.send_request_session, path, query);

	def send_request_session(self, path: str, query: dict) -> Response:
		with self._lock:
			response = requests.get(path, params=query, headers=HEADERS, cookies={'reddit_session': self._session}, impersonate="chrome")
			headers = response.headers
			self._consumed = float(headers.get("X-Ratelimit-Used", self._consumed))
			self._left = float(headers.get("X-Ratelimit-Remaining", self._left))
			countdown = float(headers.get("X-Ratelimit-Reset", 60.0))
			self._deadline = monotonic() + countdown
		return response
		

	
