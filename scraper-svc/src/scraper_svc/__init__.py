import asyncio
import scraper_svc.globals as g
from sys import exit
from scraper_svc.ScrapingWorker import ScrapingWorker



def main() -> None:
	g.logger.info("Starting scraping service...")
	try:
		g.settings.init_settings()
		g.db.init_database(g.settings.get_database_url())
		manager = ScrapingWorker()
		asyncio.run(manager.start())
	except Exception as e:
		g.logger.error(str(e))
		g.logger.error("Shutting down...")
		exit(1)

if (__name__ == '__main__'):
	main()
