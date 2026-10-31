import os
from scraper_svc.Logger import Logger
from scraper_svc.Settings import Settings
from scraper_svc.Database import Database
from scraper_svc.SessionManager import SessionManager
from scraper_svc.EventManager import EventManager

REDIS_URL = f"redis://{os.getenv('REDIS_HOST', 'redis')}:{os.getenv('REDIS_PORT', '6379')}"
MAX_WORKER=5

logger = Logger()

settings = Settings()

db = Database()

session = SessionManager()

events = EventManager()
