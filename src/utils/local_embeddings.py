"""Free local embedding helpers for prototype retrieval.

This deterministic hash embedding is lightweight and API-free. It is good
enough to keep vector-store flows working in a hosted demo without downloading
models or calling paid embedding services.
"""

import os
import hashlib
import math
import re
from typing import List, Optional


class LocalHashEmbedding:
    def __init__(self, dimensions: Optional[int] = None):
        self.dimensions = dimensions or int(os.getenv("EMBEDDING_DIMENSIONS", "1024"))

    def __call__(self, texts):
        if isinstance(texts, str):
            texts = [texts]
        return self.embed_documents(texts)

    def embed_documents(self, texts: List[str]) -> List[List[float]]:
        return [self.embed_query(text or "") for text in texts]

    def embed_query(self, text: str) -> List[float]:
        vector = [0.0] * self.dimensions
        tokens = re.findall(r"[a-z0-9]+", text.lower())
        for token in tokens:
            digest = hashlib.sha256(token.encode("utf-8")).digest()
            index = int.from_bytes(digest[:4], "big") % self.dimensions
            sign = 1.0 if digest[4] % 2 == 0 else -1.0
            vector[index] += sign

        norm = math.sqrt(sum(value * value for value in vector))
        if norm == 0:
            return vector
        return [value / norm for value in vector]


class HuggingFaceInferenceEmbedding:
    """Hugging Face Inference Providers embedding function."""

    def __init__(self, api_key: str, model_name: str):
        try:
            from huggingface_hub import InferenceClient
        except ImportError as exc:
            raise RuntimeError("Install huggingface_hub to use Hugging Face embeddings.") from exc

        self.client = InferenceClient(provider="hf-inference", api_key=api_key)
        self.model_name = model_name
        self.fallback = LocalHashEmbedding()

    def __call__(self, texts):
        if isinstance(texts, str):
            texts = [texts]
        return self.embed_documents(texts)

    def embed_documents(self, texts: List[str]) -> List[List[float]]:
        try:
            result = self.client.feature_extraction(
                texts,
                model=self.model_name,
                normalize=True,
                truncate=True,
            )
            return self._normalize_result(result, len(texts))
        except Exception as exc:
            print(f"WARNING: Hugging Face embeddings failed, using local embeddings: {exc}")
            return self.fallback.embed_documents(texts)

    def embed_query(self, text: str) -> List[float]:
        return self.embed_documents([text])[0]

    def _normalize_result(self, result, expected_count: int) -> List[List[float]]:
        vectors = result.tolist() if hasattr(result, "tolist") else result

        if expected_count == 1 and vectors and isinstance(vectors[0], (int, float)):
            return [list(vectors)]

        if vectors and isinstance(vectors[0], list):
            return [list(vector) for vector in vectors[:expected_count]]

        raise ValueError("Unexpected Hugging Face feature-extraction response shape")


def get_huggingface_token() -> Optional[str]:
    return (
        os.getenv("HF_TOKEN")
        or os.getenv("HUGGINGFACEHUB_API_TOKEN")
        or os.getenv("HUGGINGFACE_API_KEY")
    )


def create_embedding_function():
    provider = os.getenv("EMBEDDING_PROVIDER", "huggingface" if get_huggingface_token() else "local").lower()
    model_name = os.getenv("EMBEDDING_MODEL", "BAAI/bge-m3")

    if provider in ("huggingface", "hf"):
        token = get_huggingface_token()
        if token:
            try:
                print(f"Using Hugging Face embeddings: {model_name}")
                return HuggingFaceInferenceEmbedding(token, model_name)
            except Exception as exc:
                print(f"WARNING: Could not initialize Hugging Face embeddings: {exc}")
        else:
            print("WARNING: EMBEDDING_PROVIDER=huggingface but no HF_TOKEN is set.")

    print("Using free local hash embeddings.")
    return LocalHashEmbedding()
