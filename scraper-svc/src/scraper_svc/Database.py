import scraper_svc.globals as g
from sqlalchemy import Engine, create_engine
from sqlalchemy.orm import Session, sessionmaker
from sqlalchemy import URL



class Database:
	_engine: Engine | None
	_SessionLocal: sessionmaker[Session] | None

	class DatabaseError(Exception):
		pass

	def __init__(self) -> None:
		self._engine = None
		self._SessionLocal = None
	
	def init_database(self, url: URL) -> None:
		self._log("Initializing database")

		self._engine = create_engine(url)
		self._SessionLocal = sessionmaker(
			bind=self._engine,
			expire_on_commit=False,
		)

	def _log(self, msg: str):
		g.logger.info("Database: %s", msg)

	def _error(self, msg:str):
		raise self.DatabaseError(f"Database: {msg}")

	def get_session(self):
		if self._SessionLocal is None:
			self._error("Session local is not initialized")
		return (self._SessionLocal())

	def close(self):
		if self._engine:
			self._engine.dispose()
	

