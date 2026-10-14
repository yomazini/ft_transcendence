import requests

def scrape_mode(session_id: str, target: str, limit: int = 0, mode: str = "post") -> requests.Response:
    return scrape_post(session_id, target, limit)

def scrape_post(session_id: str, target: str, limit: int) -> requests.Response:
    response = requests.get(target, params={'limit': limit}, cookies={'reddit_session': session_id})
    return response
