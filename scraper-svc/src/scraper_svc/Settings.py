import os, hvac, logging
from scraper_svc.Login import Login
from sqlalchemy import URL

DB_DRIVER=os.getenv('DB_DRIVER', "postgresql+psycopg") 
DB_DNS=os.getenv('DB_DNS', "postgres")
VAULT_DNS=os.getenv('VAULT_DNS', "vault")
PORT=5432

class Settings:
	client: hvac.Client
	credentials: Login
	url: URL | None
	sessions: list[str]

	def __init__(self):
		self.client = hvac.Client(url=f"http://{VAULT_DNS}:8200")
		self.credentials = Login()
		self.url = None
		self.sessions = []

	async def login(self) -> None:
		self.credentials.load()
		self.client.auth.approle.login(
			role_id=self.credentials.role_id,
			secret_id=self.credentials.secret_id
		)

	async def init_sessions(self) -> None:
		secret = self.client.secrets.kv.v2.read_secret_version(
			path='scraper-svc',
			mount_point='secret',
			raise_on_deleted_version=True
		) 

		data = secret["data"]["data"]["sessions"]
		self.sessions = data.split(',')

	async def init_database(self) -> None:
		secret = self.client.secrets.kv.v2.read_secret_version(
			path='database',
			mount_point='secret',
			raise_on_deleted_version=True
		)
		data = secret["data"]["data"]
		self.url = URL.create(
			drivername="postgresql+psycopg",
			username=data["user"],
			database=data["database"],
			password=data["password"],
			host=DB_DNS,
			port=PORT
		)

	async def init_settings(self):
		logging.getLogger("scraper-svc").info(f"Getting secrets from {VAULT_DNS}...")
		await self.login()
		await self.init_sessions()
		await self.init_database()

	
		
		

	
