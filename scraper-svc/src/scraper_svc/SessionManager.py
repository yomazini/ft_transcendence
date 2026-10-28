import scraper_svc.globals as g
from time import sleep, monotonic
from threading import Condition, Thread

REST_TIME=1
BREAK_TIME=60

class SessionManager:
	_sessions: list[str]
	_condition: Condition
	_cooldown: float


	def __init__(self) -> None:
		self._sessions = g.settings.get_sessions()
		self._condition = Condition()
		self._cooldown = 0.0

	def acquire(self)-> str:
		with self._condition:
			while True:
				rest = self._cooldown - monotonic()
				if rest > 0:
					self._condition.wait(timeout=rest)
					continue

				if self._sessions:
					return self._sessions.pop()
				
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
			self._condition.notify()

	def release(self, cookie: str) -> None:
		Thread(
			target=self._delayed_release,
			args=(cookie, ),
			daemon=True
		).start()
