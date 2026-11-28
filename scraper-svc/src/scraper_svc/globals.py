import os
from prometheus_client import Counter, Gauge, Histogram
from scraper_svc.Logger import Logger
from scraper_svc.Settings import Settings
from scraper_svc.Database import Database
from scraper_svc.SessionManager import SessionManager
from scraper_svc.EventManager import EventManager

REDIS_URL = f"redis://{os.getenv('REDIS_HOST', 'redis')}:{os.getenv('REDIS_PORT', '6379')}"
MAX_WORKER=os.getenv("MAX_WORKER", "5")
LIMIT=os.getenv("POST_LIMIT", "10")

scraper_jobs_total = Counter(
	"scraper_jobs_total",
	"total number of scrape jobs done/failed",
	["result"]
)

scraper_comments_total = Counter(
	"scraper_comments_total",
	"number of comments saved"
)

scraper_reddit_requests_total = Counter(
	"scraper_reddit_requests_total",
	"total number of request to reddit",
	["status"]
)

scraper_jobs_in_progress = Gauge(
	"scraper_jobs_in_progress",
	"jobs currently being scraped"
)

scraper_job_duration_seconds = Histogram(
	"scraper_job_duration_seconds",
	"the duration that a job takes",
	["mode"]
)

logger = Logger()

settings = Settings()

db = Database()

session = SessionManager()

events = EventManager()
