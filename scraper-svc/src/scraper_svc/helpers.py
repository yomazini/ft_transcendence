import enum,hashlib, json
import scraper_svc.globals as g
from curl_cffi import requests, Response
from typing import Any
from uuid import uuid4
from sqlalchemy.orm import Session
from sqlalchemy import update, select, and_
from scraper_svc.models import Comments, Jobmodes, Job, SubJob, Jobmodes

# Reddit scrapping

BASE_URL="https://oauth.reddit.com"

class WorkerState(enum.IntEnum):
	SCRAPE = 0
	CREATE_SUBJOBS = 1
	SCRAPE_SUBJOB = 2
	SAVE_NORM_DATA = 3
	INSERT_BULK = 4
	DONE = 5

class BadJobError(Exception):
	pass

# Validation helpers

def clean_split(string:str, sep:str) -> list[str]:
	return list(filter(None, string.split(sep)))

def valid_keyword_url(path: str) -> tuple[str, dict]:
	return f"{BASE_URL}/search.json", {'q': path, 'limit': g.LIMIT}

def valid_user_url(path: str) -> tuple[str, dict]:
	path_list: list[str] = clean_split(path, "/")
	print (path_list, flush=True)
	if (len(path_list) != 2
		or path_list[0] != 'user'):
		raise RuntimeError("Invalid user")
	return f"{BASE_URL}/{"/".join(path_list)}/submitted.json", {'limit': g.LIMIT}

def valid_subreddit_url(path: str) -> tuple[str, dict]:
	path_list: list[str] = clean_split(path, "/")
	if (len(path_list) != 3
		or path_list[0] != 'r'
		or path_list[2] not in ["top", "new", "rising", "best", "hot"]):
		raise RuntimeError("Invalid subreddit")
	return f"{BASE_URL}/{"/".join(path_list)}.json", {'limit': g.LIMIT}

def valid_post_url(path: str) -> str:
	path_list: list[str] = clean_split(path, "/")
	if (len(path_list) != 5
		or path_list[0] != 'r'
		or path_list[2] != "comments"):
		raise RuntimeError("Invalid post url")
	return f"{BASE_URL}/{'/'.join(path_list)}.json"

def get_scrape_target(target: str, mode: Jobmodes) -> tuple[str, dict]:
	match mode:
		case Jobmodes.SUBREDDIT:
			return (valid_subreddit_url(target))
		case Jobmodes.USER:
			return (valid_user_url(target))
		case Jobmodes.KEYWORD:
			return (valid_keyword_url(target))
		case Jobmodes.POST:
			raise RuntimeError("Impossible action error")

# Scraper

async def scrape(target: str, query:dict) -> list[dict[str, Any]] | dict[str, Any]:
	await g.session.reserve()
	response: Response | None = None
	try:
		response = await g.session.send_request(target, query)
	finally:
		await g.session.release()
	g.scraper_reddit_requests_total.labels(str(response.status_code)).inc()
	if (response.status_code >= 400 and response.status_code < 500):
		raise BadJobError(f"{response.reason} {response.status_code}")
	response.raise_for_status()
	return response.json()

# Normalization functions

def normalize_comments(data: list):
	comments = []
	for item in data:
		if item["kind"] != "t1":
			continue
		comment_content = item["data"]
		if comment_content["author"] == "AutoModerator":
			continue
		comment = {}
		comment["body"] = comment_content["body"]
		comment["author"]= comment_content["author"]
		comment["upvotes"]= comment_content["ups"]
		comment["reddit_id"]= comment_content["name"]
		comment["children"]=[]
		if comment_content["replies"] != "":
			comment["children"] = normalize_comments(comment_content["replies"]["data"]["children"])
		comments.append(comment)
	return (comments)

def normalize_post(data: list):
	comments = {}
	post_data = data[0]["data"]["children"][0]["data"]
	comments["body"] = "\n\n".join(
		part
		for part in (post_data["title"], post_data["selftext"])
		if part
	)
	comments["upvotes"]=post_data["ups"]
	comments["author"]=post_data["author"]
	comments["reddit_id"]=post_data["name"]
	comments["children"] = normalize_comments(data[1]["data"]["children"])
	return comments

def normalize_posts(data:dict):
	data_array = data["data"]["children"]
	l = []
	for item in data_array:
		if item["kind"] != "t3":
			continue
		post_content = item["data"]
		l.append(post_content["permalink"])
	return l

# def normalize_data(data: list | dict, mode: Jobmodes) ->  dict | list:
# 	match mode:
# 		case Jobmodes.POST:
# 			if (not isinstance(data, list)):
# 				raise RuntimeError("Impossible action error")
# 			return (normalize_post(data))
# 		case _:
# 			if (not isinstance(data, dict)):
# 				raise RuntimeError("Impossible action error")
# 			return (normalize_posts(data))

# Database Insertion

def insert_comments(session:Session, job_id:str, parent_id: str | None, data: dict) -> int:
	comment_count = 0
	hashed_data = hashlib.sha256(json.dumps({k: data[k] for k in ("body", "upvotes")}, sort_keys=True).encode("utf-8")).hexdigest()
	comment: Comments | None = session.execute(
		select(Comments).where(and_(
			Comments.job_id == job_id,
			Comments.reddit_id == data["reddit_id"]
		))
	).scalar_one_or_none()
	if (comment):
		if (hashed_data != comment.hash):
			comment.hash = hashed_data
			comment.text_ = data["body"]
			comment.upvotes = data["upvotes"]
	else:
		comment = Comments(
			id=str(uuid4()),
			job_id=job_id,
			text_=data["body"],
			upvotes=data["upvotes"],
			hash=hashed_data,
			reddit_id=data["reddit_id"],
			author=data["author"],
			parent_id = parent_id
		)
		session.add(comment)
	for comment_data in data["children"]:
		comment_count += insert_comments(session, job_id, comment.id, comment_data)
	return comment_count + 1

async def update_job_status(session: Session, job_id: str, job_status: str,error:str | None = None):
	j_id = session.execute(
		update(Job)
		.where(Job.id == job_id)
		.values(status=job_status)
		.returning(Job.id)
	).scalar_one_or_none()
	if j_id is None:
		raise BadJobError("job doesn't exist")
	session.commit()
	await g.events.publish(job_id, job_status, error)

# get from db

def get_job(session: Session, job_id:str) -> Job:
	job = (session.get(Job, job_id))
	if job is None:
		raise BadJobError(f"Job [{job_id}] doesn't exist")
	return (job)

def get_subjob(session: Session, job_id:str) -> SubJob:
	job = session.get(SubJob, job_id)
	if job is None:
		raise BadJobError(f"SubJob [{job_id}] doesn't exist")
	return (job)

# save cleanup

async def safe_update_job_status(session: Session, job_id: str, job_status: str,error:str | None = None):
	try:
		await update_job_status(session, job_id, job_status, error)
	except:
		pass

def safe_rollback(session: Session):
	try:
		session.rollback()
	except Exception:
		pass

def safe_cleanup(session: Session):
	try:
		session.close()
	except Exception:
		pass