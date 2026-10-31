import scraper_svc.globals as g
from curl_cffi import requests, Response
from typing import Any
from uuid import uuid4
from sqlalchemy.orm import Session
from urllib.parse import urlparse, ParseResult
from sqlalchemy import update
from scraper_svc.models import Comments, Jobmodes, Job
from scraper_svc.models import Jobmodes

# Reddit scrapping

BASE_URL="https://www.reddit.com"
HEADERS = {
	"User-Agent": "linux:ft-transcendence-scraper:v0.1",
	"Accept": "application/json",
}

class RateLimitError(Exception):
    pass

class BadJobError(Exception):
		pass

def valid_post_url(url: str) -> str:
	parsed: ParseResult = urlparse(url)
	if parsed.scheme != "https" or parsed.hostname not in {'www.reddit.com', 'reddit.com'}:
		raise RuntimeError("Invalid post url")
	return f"{BASE_URL}{parsed.path.removesuffix('/')}.json"

def scrape(target: str, limit: int) -> list[dict[str, Any]]:
	response:Response | None = None
	session_id = g.session.acquire()
	try:
		response = requests.get(target, headers=HEADERS,params={'limit': limit}, cookies={'reddit_session': session_id})
	finally:
		g.session.release(session_id)
	g.scraper_reddit_requests_total.labels(str(response.status_code)).inc()
	if response.status_code == 429:
		g.session.pause_all()
		raise RateLimitError("Reddit rate limit exceeded")

	g.logger.info("Scraper: request status [%s]", response.status_code)
	response.raise_for_status()
	return response.json()

def scrape_job(target: str, mode: Jobmodes, limit: int = 0) ->  list[dict[str, Any]]:
	match mode:
		case Jobmodes.POST:
			return scrape_post(target, limit)
		case _:
			raise TypeError("Unsupported mode");

def scrape_post(target: str, limit: int) -> list[dict[str, Any]]:
	target = valid_post_url(target)
	g.logger.info("Scraping post: %s...", target)
	response = scrape(target, limit)
	return response


# Database Insertion

def add_job(job_id: str, data:list[dict[str, Any]], mode: Jobmodes) -> None:
	total_comments: int = 0
	with g.db.get_session() as session:
		match mode:
			case Jobmodes.POST:
				total_comments = add_post(session, job_id, data)
			case _:
				raise TypeError("Unsupported mode")
	g.scraper_comments_total.inc(total_comments)

def add_post(session: Session, job_id, data:list[dict[str, Any]]) -> int:
	post_data = data[0]["data"]["children"][0]["data"]
	body = "\n\n".join(
		part
		for part in (post_data["title"], post_data["selftext"])
		if part
	)
	post_id = str(uuid4())
	post = Comments(
		id=post_id,
		job_id=job_id,
		text_=body,
		upvotes=post_data["ups"],
		author=post_data["author"],
		parent_id=None
	)
	session.add(post)
	return add_comments(session, job_id, post_id, data[1]["data"]["children"]) + 1


def add_comments(session: Session, job_id:str, parent_id: str, data: list[dict[str, Any]]) -> int:
	total_comments: int = 0
	for item in data:
		comment_data = item["data"]
		comment_id = str(uuid4())
		comment = Comments(
			id=comment_id,
			job_id=job_id,
			text_=comment_data["body"],
			upvotes=comment_data["ups"],
			author=comment_data["author"],
			parent_id=parent_id
		)
		session.add(comment)
		total_comments += 1
		if comment_data["replies"] == "":
			continue
		total_comments += add_comments(session, job_id, comment_id, comment_data["replies"]["data"]["children"])
	return (total_comments)

async def update_job_status(job_id: str, job_status: str,error:str | None):
	with g.db.get_session() as session:
		session.execute(
			update(Job)
			.where(Job.id == job_id)
			.values(status=job_status)
			.returning(Job.id)
		).scalar_one()

	await g.events.publish(job_id, job_status, error)

# get from db

def get_job(job_id:str) -> Job:
	with g.db.get_session() as session:
		job = (session.get(Job, job_id))
		if job is None:
			raise BadJobError(f"Job [{job_id}] doesn't exist")
		return (job)