import scraper_svc.globals as g
from curl_cffi import requests
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

def valid_post_url(url: str) -> str:
	parsed: ParseResult = urlparse(url)
	if parsed.scheme != "https" or parsed.hostname not in {'www.reddit.com', 'reddit.com'}:
		raise RuntimeError("Invalid post url")
	return f"{BASE_URL}{parsed.path.removesuffix('/')}.json"

def scrape(target: str, limit: int) -> list[dict[str, Any]]:
	session_id = g.session.acquire()
	try:
		response = requests.get(target, headers=HEADERS,params={'limit': limit}, cookies={'reddit_session': session_id})
	finally:
		g.session.release(session_id)

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
	with g.db.get_session() as session:
		match mode:
			case Jobmodes.POST:
				return add_post(session, job_id, data)
			case _:
				raise TypeError("Unsupported mode")

def add_post(session: Session, job_id, data:list[dict[str, Any]]) -> None:
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
	add_comments(session, job_id, post_id, data[1]["data"]["children"])


def add_comments(session: Session, job_id:str, parent_id: str, data: list[dict[str, Any]]) -> None:
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
		if comment_data["replies"] == "":
			continue
		add_comments(session, job_id, comment_id, comment_data["replies"]["data"]["children"])

async def update_job_status(job_id: str, job_status: str,error:str | None):
	with g.db.get_session() as session:
		session.execute(
			update(Job)
			.where(Job.id == job_id)
			.values(status=job_status)
			.returning(Job.id)
		).scalar_one()

	await g.events.publish(job_id, job_status, error)