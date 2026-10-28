import logging

def setup_logging() -> None:
	logging.basicConfig(
		level=logging.INFO,
		format=(
			"%(levelname)s | %(message)s"
		),
		force=True,
	)

class Logger:
	_logger: logging.Logger = logging.getLogger("scraper-svc")

	def __init__(self) -> None:
		self._logger = logging.getLogger("scraper-svc")

	def info(self, msg:str, *args):
		self._logger.info(msg, *args)

	def warning(self, msg:str, *args):
		self._logger.warning(msg, *args)

	def error(self, msg:str, *args):
		self._logger.error(msg, *args)


setup_logging()
