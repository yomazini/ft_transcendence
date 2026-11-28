import asyncio
import scraper_svc.globals as g
from curl_cffi import requests, Response, Headers
from collections import deque
from time import monotonic
from scraper_svc.helpers import BadJobError
from typing import cast

HEADERS = {
	"User-Agent": "linux:ft-transcendence-scrape:v0.1",
	"Accept": "application/json",
}

class SessionBucket:
	_use_api: bool = False
	_client_id: str = ""
	_client_secret: str = ""
	_api_token: str = ""
	_expires: float = 0.0
	_session: str = ""
	_consumed: float = 0.0
	_left: float = 0.0
	_deadline: float = 0.0
	# _reserved: int = 0

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
	
	def __init__(self, api: tuple[str | None, str | None], session: str):
		self._use_api = False
		if None not in api:
			self._client_id, self._client_secret = api
			self._use_api = self._authenticate()
		if not self._use_api:
			self._session = session
		self._left = 0.0
		self._consumed = 0.0
		self._deadline = monotonic()

	def get_reset_time(self):
		time_left = self._deadline - monotonic()
		return time_left if time_left > 0.0 and self._left < 1.0 else None

	async def send_request(self, path: str, query: dict) -> Response:
		if self._use_api:
			return await asyncio.to_thread(self.send_request_api, path, query)
		else:
			return await asyncio.to_thread(self.send_request_session, path, query);
	
	def _extract_limits(self, headers: Headers):
		self._consumed = float(headers.get("X-Ratelimit-Used", self._consumed))
		self._left = float(headers.get("X-Ratelimit-Remaining", self._left))
		countdown = float(headers.get("X-Ratelimit-Reset", 60.0))
		self._deadline = monotonic() + countdown

	def	send_request_api(self, path:str, query: dict) -> Response:
		expired = self._expires -  monotonic()
		if expired < 60 and not self._authenticate():
			raise BadJobError("can't re-authenticate")
		response = requests.get(path, params=query, headers={**HEADERS, "Authorization": f"Bearer {self._api_token}"}, impersonate="chrome")
		headers = response.headers
		self._extract_limits(headers)
			
		return response

	def send_request_session(self, path: str, query: dict) -> Response:
		response = requests.get(path, params=query, headers=HEADERS, cookies={'reddit_session': self._session}, impersonate="chrome")
		headers = response.headers
		self._extract_limits(headers)
		return response



class SessionManager:
	# _initialized: bool = False
	# _use_api: bool = False
	# _client_id: str = ""
	# _client_secret: str = ""
	# _api_token: str = ""
	# _expires: float = 0.0
	# _session: str = ""
	# _reserved: int = 0
	# _consumed: float = 0.0
	# _left: float = 0.0
	# _deadline: float = 0.0
	_buckets : list[SessionBucket] = []
	_reserve_list: deque[int] = deque([])
	_lock = asyncio.Lock()

	# def _authenticate(self):
	# 	response = requests.post(
	# 		"https://www.reddit.com/api/v1/access_token",
    # 		auth=(self._client_id, self._client_secret),
    # 		data={"grant_type": "client_credentials"},
    # 		headers=HEADERS,
	# 		impersonate="chrome"
	# 	)
	# 	if (response.status_code != 200):
	# 		return False
	# 	data = cast(dict[str,str], response.json())
	# 	self._api_token = data.get("access_token", "")
	# 	self._expires = monotonic() + float(data.get("expires_in", 0.0))
	# 	return True

	def init_session_manager(self):
		api = g.settings.get_api_creds()
		sessions = g.settings.get_sessions()
		for i in range(len(api)):
			if (None in api[i] and sessions[i] is None):
				continue
			self._buckets.append(SessionBucket(api[i], sessions[i]))
		size = len(self._buckets)
		if size == 0:
			raise RuntimeError("No valid credentials exist")
		self._reserve_list = deque(range(len(self._buckets)))
		# printf(self._reserve())
		# if None not in api:
		# 	self._client_id, self._client_secret = api
		# 	self._use_api = self._authenticate()
		# if not self._use_api:
		# 	g.logger.info("Scrapper manager: %s", "Using session mode")
		# 	self._session = g.settings.get_session()
		# else:
		# 	g.logger.info("Scrapper manager: %s", "Using api mode")

		# self._deadline = monotonic()

	async def reserve(self):
		while (True):
			wait_time = None
			async with self._lock:
				size = len(self._reserve_list)
				for _ in range(size):
					bucket_index = self._reserve_list.pop()
					time_left = self._buckets[bucket_index].get_reset_time()
					if time_left is None: 
						g.logger.info("Scrape manager: reserved bucket [%d]", bucket_index)
						return bucket_index
					if wait_time is None or wait_time > time_left:
						wait_time = time_left 
					self._reserve_list.appendleft(bucket_index)
			if wait_time is None:
				wait_time = 1.0
			g.logger.info("Waitting for buckets next available one at: %.1f", wait_time)
			await asyncio.sleep(wait_time)
		# while(True):
		# 	sleep_time = 0.0
		# 	with self._lock:
		# 		sleep_time = self._deadline - monotonic()
		# 		if (sleep_time <= 1 and self._reserved == 0) or self._left > self._reserved + 1:
		# 			self._reserved += 1
		# 			break
		# 	sleep(max(1, sleep_time))

	async def release(self, bucket_index: int):
		async with self._lock:
			self._reserve_list.appendleft(bucket_index)
		g.logger.info("Scrape manager: released bucket [%d]", bucket_index)



	async def send_request(self, bucket_index: int, path: str, query: dict) -> Response:
		return await self._buckets[bucket_index].send_request(path, query)


	def get_workers(self):
		return len(self._buckets)


	# def _extract_limits(self, headers: Headers):
	# 	self._consumed = float(headers.get("X-Ratelimit-Used", self._consumed))
	# 	self._left = float(headers.get("X-Ratelimit-Remaining", self._left))
	# 	countdown = float(headers.get("X-Ratelimit-Reset", 60.0))
	# 	self._deadline = monotonic() + countdown
	# 	g.logger.info("Scrape manager: requests remaining: %.1f", self._left)
	# 	g.logger.info("Scrape manager: requests consumed: %.1f", self._consumed)
	# 	g.logger.info("Scrape manager: rate limit resets in %.1f seconds", countdown)

	# def	send_request_api(self, path:str, query: dict) -> Response:
	# 	with self._lock:
	# 		expired = self._expires -  monotonic()
	# 		if expired < 60 and not self._authenticate():
	# 			raise BadJobError("can't re-authenticate")
	# 		response = requests.get(path, params=query, headers={**HEADERS, "Authorization": f"Bearer {self._api_token}"}, impersonate="chrome")
	# 		headers = response.headers
	# 		self._extract_limits(headers)
			
	# 	return response

	# def send_request_session(self, path: str, query: dict) -> Response:
	# 	with self._lock:
	# 		response = requests.get(path, params=query, headers=HEADERS, cookies={'reddit_session': self._session}, impersonate="chrome")
	# 		headers = response.headers
	# 		self._extract_limits(headers)
	# 	return response
