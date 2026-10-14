import hashlib
import logging
from typing import Any

import numpy as np

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


def _generate_mock_embedding(text: str) -> list[float]:
    seed = int(hashlib.sha256(text.encode("utf-8")).hexdigest()[:8], 16)
    rng = np.random.default_rng(seed)
    vec = rng.standard_normal(384).astype(np.float32)
    norm = np.linalg.norm(vec)
    if norm > 0:
        vec = vec / norm
    return vec.tolist()


def generate_embedding(text: str) -> list[float]:
    if settings.use_mock_embeddings:
        return _generate_mock_embedding(text)
    try:
        model = _get_model()
        vec = model.encode(text, normalize_embeddings=True)
        return [float(x) for x in vec.tolist()]
    except Exception as e:
        logger.warning("Falling back to mock embedding: %s", e)
        return _generate_mock_embedding(text)


def generate_embeddings(texts: list[str]) -> list[list[float]]:
    return [generate_embedding(t) for t in texts]
