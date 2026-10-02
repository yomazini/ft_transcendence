import hashlib
import numpy as np


def generate_embedding(text: str, dim: int = 384) -> list[float]:
    text_hash = int(hashlib.sha256(text.encode()).hexdigest(), 16)
    rng = np.random.RandomState(text_hash % (2**31))
    vec = rng.randn(dim).astype(np.float32)
    norm = np.linalg.norm(vec)
    if norm > 0:
        vec = vec / norm
    return vec.tolist()


def generate_embeddings(texts: list[str], dim: int = 384) -> list[list[float]]:
    return [generate_embedding(t, dim) for t in texts]
