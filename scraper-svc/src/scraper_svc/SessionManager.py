import asyncio
import scraper_svc.globals as g
from curl_cffi import requests, Response
from time import sleep, monotonic
from threading import Lock

HEADERS = {
	"User-Agent": "linux:ft-transcendence-scraper:v0.1",
	"Accept": "application/json",
}

OUOTA_LIMIT=100

# REST_TIME=10
# BREAK_TIME=60

# class SessionManager:
# 	_data: list[str] | None
# 	_sessions: list[str]
# 	_condition: Condition
# 	_cooldown: float


# 	def __init__(self) -> None:
# 		self._data = None
# 		self._sessions = []
# 		self._condition = Condition()
# 		self._cooldown = 0.0

# 	def init_session_manager(self, sessions: list[str]):
# 		self._data = sessions
# 		self._sessions = self._data

# 	def acquire(self)-> str:
# 		with self._condition:
# 			while True:
# 				rest = self._cooldown - monotonic()
# 				if rest > 0:
# 					self._condition.wait(timeout=rest)
# 					continue

# 				if self._sessions:
# 					cookie = self._sessions.pop()
# 					self._log(f"session granted left [{len(self._sessions)}]")
# 					return cookie
				
# 				self._condition.wait()

# 	def pause_all(self):
# 		with self._condition:
# 			self._cooldown = max(
# 				self._cooldown,
# 				monotonic() + BREAK_TIME
# 			)
# 			self._condition.notify_all()

# 	def release(self, cookie: str) -> None:
# 		with self._condition:
# 			self._sessions.insert(0, cookie)
# 			self._log(f"session retreived left [{len(self._sessions)}]")
# 			self._condition.notify()

# 	def _log(self, msg: str):
# 		g.logger.info("Session manager: %s", msg)

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
		self._session = g.settings.get_sessions()[0]
		self._deadline = monotonic()
		# self.send_request_session("https://www.reddit.com/api/v1/me", {})
		self._initialized = True

	async def reserve(self, request_count: int = 1):
		await asyncio.to_thread(self._reserve, request_count)

	def _reserve(self, request_count: int):
		while(True):
			sleep_time = 0.0
			with self._lock:
				sleep_time = self._deadline - monotonic()
				if (sleep_time <= 1 and self._reserved == 0) or self._left > self._reserved + request_count:
					self._reserved += request_count
					break
			sleep(max(1, sleep_time))

	async def release(self, request_count: int = 1):
		await asyncio.to_thread(self._release, request_count)

	def _release(self, request_count: int):
		with self._lock:
			self._reserved -= request_count



	async def send_request(self, path: str, query: dict) -> Response:
		return await asyncio.to_thread(self.send_request_session, path, query);

	def send_request_session(self, path: str, query: dict) -> Response:
		response = requests.get(path, params=query, headers=HEADERS, cookies={'reddit_session': self._session}, impersonate="chrome")
		with self._lock:
			headers = response.headers
			self._consumed = float(headers.get("X-Ratelimit-Used", self._consumed))
			self._left = float(headers.get("X-Ratelimit-Remaining", self._left))
			countdown = self._time_for_reset = float(headers.get("X-Ratelimit-Reset", self._time_for_reset))
			self._deadline = monotonic() + countdown
		return response
		

	
