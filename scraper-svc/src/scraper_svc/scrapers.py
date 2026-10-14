import os, time
from urllib.parse import urlparse
import requests

HEADERS = {'User-Agent': 'python:ft-transcendence-scraper:v0.1'}
MAX_COMMENTS = 100
POSTS_PER_LISTING = 3

# Reddit blocks anonymous JSON requests (403). Two ways in, tried in this order:
#   1. the official API with a Reddit "script" app (REDDIT_CLIENT_ID / REDDIT_CLIENT_SECRET)
#   2. a logged-in browser session cookie (SESSION_IDS / REDDIT_SESSIONS)
_token = {'value': None, 'expires': 0.0}

def _real(value: str | None) -> str | None:
    return value if value and value != 'changeme' else None

def _oauth_token() -> str | None:
    client_id, secret = _real(os.getenv('REDDIT_CLIENT_ID')), _real(os.getenv('REDDIT_CLIENT_SECRET'))
    if not (client_id and secret):
        return None
    if _token['value'] and time.time() < _token['expires']:
        return _token['value']
    response = requests.post('https://www.reddit.com/api/v1/access_token', auth=(client_id, secret),
                             data={'grant_type': 'client_credentials'}, headers=HEADERS, timeout=20)
    response.raise_for_status()
    data = response.json()
    _token['value'] = data['access_token']
    _token['expires'] = time.time() + data.get('expires_in', 3600) - 60
    return _token['value']

def scrape_mode(session_id: str | None, target: str, limit: int = 0, mode: str = "post") -> list[dict]:
    """Return a list of comments {text, author, upvotes} for a job target."""
    mode = (mode or 'post').lower()
    if mode == 'post':
        return scrape_post(session_id, urlparse(target).path, limit)
    if mode == 'subreddit':
        name = target.strip().removeprefix('/').removeprefix('r/').strip('/')
        return scrape_listing(session_id, f"/r/{name}/top", {'t': 'month', 'limit': 10})
    if mode == 'keyword':
        return scrape_listing(session_id, "/search", {'q': target, 'sort': 'relevance', 'limit': 10})
    if mode == 'user':
        name = target.strip().removeprefix('/').removeprefix('u/').removeprefix('user/').strip('/')
        listing = get_json(session_id, f"/user/{name}/comments", {'limit': MAX_COMMENTS})
        return [to_comment(c['data']) for c in listing['data']['children'] if c.get('kind') == 't1'][:MAX_COMMENTS]
    raise ValueError(f"unknown mode: {mode}")

def scrape_post(session_id: str | None, path: str, limit: int) -> list[dict]:
    path = path.rstrip('/').removesuffix('.json')
    data = get_json(session_id, path, {'limit': limit or MAX_COMMENTS})
    comments: list[dict] = []
    flatten(data[1]['data']['children'], comments)
    return comments[:MAX_COMMENTS]

def scrape_listing(session_id: str | None, path: str, params: dict) -> list[dict]:
    """Take the top posts of a listing, then the comments of each post."""
    listing = get_json(session_id, path, params)
    posts = [p['data'] for p in listing['data']['children'] if p.get('kind') == 't3']
    comments: list[dict] = []
    for post in posts[:POSTS_PER_LISTING]:
        comments += scrape_post(session_id, post['permalink'], MAX_COMMENTS)
        if len(comments) >= MAX_COMMENTS:
            break
    return comments[:MAX_COMMENTS]

def flatten(children: list, out: list[dict]) -> None:
    """Walk a comment tree (replies included) into a flat list."""
    for child in children:
        if child.get('kind') != 't1':
            continue
        out.append(to_comment(child['data']))
        replies = child['data'].get('replies')
        if isinstance(replies, dict):
            flatten(replies['data']['children'], out)

def to_comment(c: dict) -> dict:
    return {'text': c.get('body', ''), 'author': c.get('author') or 'reddit_user', 'upvotes': int(c.get('score', 0))}

def get_json(session_id: str | None, path: str, params: dict):
    params = {**params, 'raw_json': 1}
    token = _oauth_token()
    if token:
        response = requests.get(f"https://oauth.reddit.com{path}", params=params,
                                headers={**HEADERS, 'Authorization': f'bearer {token}'}, timeout=20)
    elif session_id:
        response = requests.get(f"https://www.reddit.com{path}.json", params=params, headers=HEADERS,
                                cookies={'reddit_session': session_id}, timeout=20)
    else:
        raise RuntimeError("no Reddit credentials: set REDDIT_CLIENT_ID and REDDIT_CLIENT_SECRET (or SESSION_IDS) in .env")
    response.raise_for_status()
    return response.json()
