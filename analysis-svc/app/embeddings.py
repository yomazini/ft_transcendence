import logging
from typing import Any

from .config import settings

logger = logging.getLogger("analysis-embeddings")

_model: Any = None


def _get_model() -> Any:
    global _model
    if _model is None:
        from sentence_transformers import SentenceTransformer

        logger.info("Loading embedding model %s", settings.embedding_model)
        _model = SentenceTransformer(settings.embedding_model)
    return _model


def warmup() -> None:
    _get_model()


def generate_embeddings(texts: list[str]) -> list[list[float]]:
    if not texts:
        return []
    model = _get_model()
    vectors = model.encode(texts, batch_size=32, normalize_embeddings=True)
    return [[float(x) for x in v] for v in vectors]


def generate_embedding(text: str) -> list[float]:
    return generate_embeddings([text])[0]
