import asyncio
import logging
from scraper_svc.ScrapingWorker import ScrapingWorker

def setup_logging() -> None:
	logging.basicConfig(
		level="INFO",
		format=(
			"%(levelname)s | %(message)s"
		),
		force=True,
	)

def main() -> None:
	setup_logging()
	logging.getLogger("scraper-svc").info("Starting scraping service...")
	manager = ScrapingWorker()
	try:
		asyncio.run(manager.start())
	except Exception as e:
		logging.getLogger("scraper-svc").error(e)
		logging.getLogger("scraper-svc").error(f"Restarting...")

if (__name__ == '__main__'):
	main()
