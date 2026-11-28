import asyncio
import scraper_svc.globals as g
from curl_cffi import requests, Response, Headers
from time import sleep, monotonic
from scraper_svc.helpers import BadJobError
from threading import Lock
from typing import cast

HEADERS = {
	"User-Agent": "linux:ft-transcendence-scrape:v0.1",
	"Accept": "application/json",
}

class SessionManager:
	_initialized: bool = False
	_use_api: bool = False
	_client_id: str = ""
	_client_secret: str = ""
	_api_token: str = ""
	_expires: float = 0.0
	_session: str = ""
	_reserved: int = 0
	_consumed: float = 0.0
	_left: float = 0.0
	_deadline: float = 0.0
	_lock = Lock()

	def _authenticate(self):
		response = requests.post(
			"https://www.reddit.com/api/v1/access_token",
    		auth=(self._client_id, self._client_secret),
    		data={"grant_type": "client_credentials"},
    		headers=HEADERS,
			impersonate="chrome"
		)
		if (response.status_code != 200):
			return False
		data = cast(dict[str,str], response.json())
		self._api_token = data.get("access_token", "")
		self._expires = monotonic() + float(data.get("expires_in", 0.0))
		return True

	def init_session_manager(self):
		self._use_api = False
		api = g.settings.get_api_creds()
		if None not in api:
			self._client_id, self._client_secret = api
			self._use_api = self._authenticate()
		if not self._use_api:
			g.logger.info("Scrapper manager: %s", "Using session mode")
			self._session = g.settings.get_session()
		else:
			g.logger.info("Scrapper manager: %s", "Using api mode")

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
		if self._api_token:
			return await asyncio.to_thread(self.send_request_api, path, query)
		else:
			return await asyncio.to_thread(self.send_request_session, path, query);

	def _extract_limits(self, headers: Headers):
		self._consumed = float(headers.get("X-Ratelimit-Used", self._consumed))
		self._left = float(headers.get("X-Ratelimit-Remaining", self._left))
		countdown = float(headers.get("X-Ratelimit-Reset", 60.0))
		self._deadline = monotonic() + countdown
		g.logger.info("Scrape manager: requests remaining: %.1f", self._left)
		g.logger.info("Scrape manager: requests consumed: %.1f", self._consumed)
		g.logger.info("Scrape manager: rate limit resets in %.1f seconds", countdown)

	def	send_request_api(self, path:str, query: dict) -> Response:
		with self._lock:
			expired = self._expires -  monotonic()
			if expired < 60 and not self._authenticate():
				raise BadJobError("can't re-authenticate")
			response = requests.get(path, params=query, headers={**HEADERS, "Authorization": f"Bearer {self._api_token}"}, impersonate="chrome")
			headers = response.headers
			self._extract_limits(headers)
			
		return response

	def send_request_session(self, path: str, query: dict) -> Response:
		with self._lock:
			response = requests.get(path, params=query, headers=HEADERS, cookies={'reddit_session': self._session}, impersonate="chrome")
			headers = response.headers
			self._extract_limits(headers)
		return response
