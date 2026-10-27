from sqlalchemy import Engine, create_engine
from typing import Any
from sqlalchemy.orm import Session, sessionmaker
from scraper_svc.models import Comments, Jobmodes
from sqlalchemy import URL
from uuid import uuid4


class Database:
	engine: Engine
	SessionLocal: sessionmaker[Session]
		
	def __init__(self, url: URL) -> None:
		self.engine = create_engine(url)
		self.SessionLocal = sessionmaker(
			bind=self.engine,
			expire_on_commit=False,
		)
		

	def add(self, job_id: str, data:list[dict[str, Any]], mode: Jobmodes) -> None:
		match mode:
			case Jobmodes.POST:
				return self.add_post(job_id, data)
			case _:
				raise TypeError("Unsupported mode")

	def add_post(self, job_id, data:list[dict[str, Any]]) -> None:
		if self.SessionLocal is None:
			raise RuntimeError("Session local is None")
		with self.SessionLocal.begin() as session:
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
			self.add_comments(session, job_id, post_id, data[1]["data"]["children"])		

	def add_comments(self, session: Session, job_id:str, parent_id: str, data: list[dict[str, Any]]) -> None:
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
			self.add_comments(session, job_id, comment_id, comment_data["replies"]["data"]["children"])

