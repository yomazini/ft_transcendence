import asyncio, logging
import scraper_svc.globals as g
from sys import exit
from contextlib import asynccontextmanager
from fastapi import FastAPI
from prometheus_client import make_asgi_app
from scraper_svc.ServiceWorker import ServiceWorker


@asynccontextmanager
async def lifespan(app: FastAPI):
	scraper : ServiceWorker | None = None
	workers: list[asyncio.Task] = []
	try:
		g.logger.info("Starting scraping service...")
		g.settings.init_settings()
		g.db.init_database(g.settings.get_database_url())
		g.session.init_session_manager()
		g.logger.info("Max posts is: %d", int(g.LIMIT))
		scraper = ServiceWorker()
		workers = [
			asyncio.create_task(scraper.start()),
		]
		yield
	except Exception as e:
		g.logger.error("[%s]: %s", type(e).__name__, e)
		g.logger.error("Shutting down...")
	finally:
		if scraper:
			await scraper.stop()
		for work in workers:
			work.cancel()
		await asyncio.gather(*workers, return_exceptions=True)
		
		g.db.close()
		await g.events.close()
	
app = FastAPI(lifespan=lifespan)

metrics=make_asgi_app()
app.mount("/metrics", metrics)

@app.get("/health")
def health():
	return {'status': 'healthy'}

class EndpointFilter(logging.Filter):
    def filter(self, record: logging.LogRecord) -> bool:
        return "/health" not in record.getMessage() and "/metrics" not in record.getMessage()


logging.getLogger("uvicorn.access").addFilter(EndpointFilter())
