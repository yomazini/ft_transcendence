import os,json
from scraper_svc.scrapers import scrape_mode

session_id = os.getenv('REDDIT_SESSION')
post_link = "https://www.reddit.com/r/learnprogramming/comments/1w6w78d/i_need_a_roadmap_for_c_programming_to_leasrn_real.json"

def main() -> None:
    response = scrape_mode(session_id, post_link)
    print(json.dumps(response.json()))

if (__name__ == '__main__'):
    main()
