import asyncio
from scraper_svc.ScrapingWorker import ScrapingWorker

def main() -> None:
    manager = ScrapingWorker()
    asyncio.run(manager.start())

if (__name__ == '__main__'):
    main()
