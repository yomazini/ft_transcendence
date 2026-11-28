import os, hvac, json
import scraper_svc.globals as g
from sqlalchemy import URL
from typing import cast

DB_DRIVER=os.getenv('DB_DRIVER', "postgresql+psycopg") 
DB_DNS=os.getenv('DB_DNS', "postgres")
CREDS_FILE: str = "/creds/login.json"
VAULT_DNS=os.getenv('VAULT_DNS', "vault")
PORT=5432
VAULT_URL=f"http://{VAULT_DNS}:8200"

class Settings:
	_client: hvac.Client
	_url: URL | None
	_api_creds: list[tuple[str | None, str | None]]
	_sessions: list[str | None]
	_role_id: str
	_secret_id: str

	class SettingError(Exception):
		pass

	def __init__(self):
		self._client = hvac.Client(url=VAULT_URL)
		self._role_id = ""
		self._secret_id = ""
		self._url = None
		self._sessions = []
		self._api_creds = []

	def _load(self) -> None:
		self._log("Loading Vault AppRole credentials")
		try:
			with open(CREDS_FILE, 'r') as f:
				data: dict[str, str] = json.load(f)
				self._role_id = data["role_id"]
				self._secret_id = data["secret_id"]
		except Exception:
			self._error(f"{CREDS_FILE} doesn't exist or permission denied")

	def _login(self) -> None:
		self._log(f"Authenticating with Vault at {VAULT_URL}")

		try:
			self._client.auth.approle.login(
				role_id=self._role_id,
				secret_id=self._secret_id
			)
		except Exception:
			self._error(f"failed to authenticate with vault")


	def _init_session(self) -> None:
		secret = self._client.secrets.kv.v2.read_secret_version(
			path='scraper-svc',
			mount_point='secret',
			raise_on_deleted_version=True
		) 

		data: dict[str,str] = cast(dict[str,str], secret["data"]["data"])

		count = int(data.get("session_count"))
		for i in range(1, count + 1):
			self._sessions.append(data.get(f"session_{i}"))
			self._api_creds.append((data.get(f"client_id_{i}"), data.get(f"client_secret_{i}")))


	def _init_database(self) -> None:
		secret = self._client.secrets.kv.v2.read_secret_version(
			path='database',
			mount_point='secret',
			raise_on_deleted_version=True
		)
		data = secret["data"]["data"]
		self._url = URL.create(
			drivername=DB_DRIVER,
			username=data["user"],
			database=data["database"],
			password=data["password"],
			host=DB_DNS,
			port=PORT
		)

	def _get_secrets(self) -> None:
		self._log("Getting application secrets")

		try:
			self._init_session()
			self._init_database()
		except Exception:
			self._error(f"failed to get secrets")



	def init_settings(self) -> None:
		self._log("Initializing application settings...")

		self._load()
		self._login()
		self._get_secrets()
		self._client.adapter.close()


		self._log("Application settings initialized successfully")


	def _close(self):
		self._client.adapter.close()

	def _log(self, msg:str) -> None:
		g.logger.info("Settings: %s", msg)

	def _error(self, msg:str):
		raise self.SettingError(f"Settings: {msg}")

	def get_sessions(self) -> list[str | None]:
		return (self._sessions)

	def get_api_creds(self) -> list[tuple[str | None, str | None]]:
		return self._api_creds

	def get_database_url(self) -> URL:
		if self._url is None:
			self._error("Database URL is not initialized")
		return (self._url)

		
		

	
