import logging
from scraper_svc.RateLimitError import RateLimitError
from curl_cffi import requests
from typing import Any
from scraper_svc.models import Jobmodes
from urllib.parse import urlparse, ParseResult

BASE_URL="https://www.reddit.com"
HEADERS = {
	"User-Agent": "linux:ft-transcendence-scraper:v0.1",
	"Accept": "application/json",
}

def valid_post_url(url: str) -> str:
	parsed: ParseResult = urlparse(url)
	if parsed.scheme != "https" or parsed.hostname not in {'www.reddit.com', 'reddit.com'}:
		raise RuntimeError("Invalid post url")
	return f"{BASE_URL}{parsed.path.removesuffix('/')}.json"

def scrape(session_id: str, target: str, limit: int) -> list[dict[str, Any]]:
	response = requests.get(target, headers=HEADERS,params={'limit': limit}, cookies={'reddit_session': session_id})
	if response.status_code == 429:
		raise RateLimitError("Reddit rate limit exceeded")
	response.raise_for_status()
	return response.json()

def scrape_mode(session_id: str, target: str, mode: Jobmodes, limit: int = 0) ->  list[dict[str, Any]]:
	match mode:
		case Jobmodes.POST:
			return scrape_post(session_id, target, limit)
		case _:
			raise TypeError("Unsupported mode");

def scrape_post(session_id: str, target: str, limit: int) -> list[dict[str, Any]]:
	target = valid_post_url(target)
	logging.getLogger("scraper-svc").info(f"Scraping post: {target}...")
	response = scrape(session_id, target, limit)
	return response