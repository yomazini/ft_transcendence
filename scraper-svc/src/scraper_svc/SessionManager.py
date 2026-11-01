import scraper_svc.globals as g
from time import sleep, monotonic
from threading import Condition, Thread

REST_TIME=10
BREAK_TIME=60

class SessionManager:
	_data: list[str] | None
	_sessions: list[str]
	_condition: Condition
	_cooldown: float


	def __init__(self) -> None:
		self._data = None
		self._sessions = []
		self._condition = Condition()
		self._cooldown = 0.0

	def init_session_manager(self, sessions: list[str]):
		self._data = sessions
		self._sessions = self._data

	def acquire(self)-> str:
		with self._condition:
			while True:
				rest = self._cooldown - monotonic()
				if rest > 0:
					self._condition.wait(timeout=rest)
					continue

				if self._sessions:
					cookie = self._sessions.pop()
					self._log(f"session granted left [{len(self._sessions)}]")
					return cookie
				
				self._condition.wait()

	def pause_all(self):
		with self._condition:
			self._cooldown = max(
				self._cooldown,
				monotonic() + BREAK_TIME
			)
			self._condition.notify_all()


	def _delayed_release(self, cookie):
		sleep(REST_TIME)
		with self._condition:
			self._sessions.insert(0, cookie)
			self._log(f"session retreived left [{len(self._sessions)}]")
			self._condition.notify()

	def release(self, cookie: str) -> None:
		Thread(
			target=self._delayed_release,
			args=(cookie, ),
			daemon=True
		).start()

	def _log(self, msg: str):
		g.logger.info("Session manager: %s", msg)
