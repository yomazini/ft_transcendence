import asyncio
import scraper_svc.globals as g
from sys import exit
from contextlib import asynccontextmanager
from fastapi import FastAPI
from prometheus_client import make_asgi_app
from scraper_svc.ScrapingWorker import ScrapingWorker
from scraper_svc.DatabaseWorker import DatabaseWorker


@asynccontextmanager
async def lifespan(app: FastAPI):
	scraper : ScrapingWorker | None = None
	inserter : DatabaseWorker | None = None
	workers: list[asyncio.Task] = []
	try:
		g.logger.info("Starting scraping service...")
		g.settings.init_settings()
		g.db.init_database(g.settings.get_database_url())
		g.session.init_session_manager(g.settings.get_sessions())
		scraper = ScrapingWorker()
		inserter = DatabaseWorker()
		workers = [
			asyncio.create_task(scraper.start()),
			asyncio.create_task(inserter.start())
		]
		yield
	except Exception as e:
		g.logger.error("[%s]: %s", type(e).__name__, e)
		g.logger.error("Shutting down...")
	finally:
		if scraper:
			await scraper.stop()
		if inserter:
			await inserter.stop()
		for work in workers:
			work.cancel()
		await asyncio.gather(*workers, return_exceptions=True)
		
		g.db.close()
		await g.events.close()
	
app = FastAPI(lifespan=lifespan)

metrics=make_asgi_app()
app.mount("/metrics/", metrics)

@app.get("/health")
def health():
	return {'status': 'healthy'}
