#!/usr/bin/env python3
"""
Ollama embedding client with model fallback.

Priority:
  1. OLLAMA_EMBED_URL (env) / OLLAMA_NETWORK_URL
  2. http://192.168.50.234:11434  (network machine, confirmed serving)
  3. http://localhost:11434       (local fallback)

Model preference (from env or defaults):
  qwen3-embedding:8b  → 4096 dims  (primary)
  qwen3-embedding:4b  → 2048 dims  (lighter)
  nomic-embed-text    → 768  dims  (fallback, always available)
"""
import os
import json
import urllib.request
import urllib.error
from typing import Optional

# ─── Config ───────────────────────────────────────────────────────────────────
OLLAMA_HOSTS = [
    os.environ.get("OLLAMA_EMBED_URL", "").rstrip("/") or None,
    os.environ.get("LOCAL_OLLAMA_NETWORK_URL", "").rstrip("/") or None,
    "http://192.168.50.234:11434",   # confirmed network host
    "http://localhost:11434",
]
OLLAMA_HOSTS = [h for h in OLLAMA_HOSTS if h]

MODEL_DIMS = {
    "qwen3-embedding:8b": 4096,
    "qwen3-embedding:4b": 2048,
    "nomic-embed-text":   768,
}

PRIMARY_MODEL   = os.environ.get("LOCAL_EMBEDDING_MODEL",    "qwen3-embedding:8b")
FALLBACK_MODELS = ["qwen3-embedding:4b", "nomic-embed-text"]
TIMEOUT_S       = 30


def _post(url: str, payload: dict) -> dict:
    data = json.dumps(payload).encode()
    req  = urllib.request.Request(
        url, data=data,
        headers={"Content-Type": "application/json"},
        method="POST",
    )
    with urllib.request.urlopen(req, timeout=TIMEOUT_S) as resp:
        return json.loads(resp.read())


def _try_embed(host: str, model: str, texts: list[str]) -> Optional[list[list[float]]]:
    """Try the /v1/embeddings (OpenAI-compat) endpoint, then /api/embeddings."""
    # OpenAI-compat endpoint (works with Ollama ≥ 0.3)
    try:
        result = _post(f"{host}/v1/embeddings", {"model": model, "input": texts})
        return [item["embedding"] for item in result["data"]]
    except Exception:
        pass

    # Ollama native endpoint (one text at a time)
    try:
        vecs = []
        for text in texts:
            result = _post(f"{host}/api/embeddings", {"model": model, "prompt": text})
            vecs.append(result["embedding"])
        return vecs
    except Exception:
        return None


def embed(texts: str | list[str]) -> tuple[list[list[float]], str, int]:
    """
    Embed one or more texts.

    Returns:
        (vectors, model_used, dim)

    Raises:
        RuntimeError if all hosts and models fail.
    """
    if isinstance(texts, str):
        texts = [texts]

    models_to_try = [PRIMARY_MODEL] + [m for m in FALLBACK_MODELS if m != PRIMARY_MODEL]

    for host in OLLAMA_HOSTS:
        for model in models_to_try:
            vecs = _try_embed(host, model, texts)
            if vecs and len(vecs) == len(texts):
                dim = len(vecs[0])
                return vecs, model, dim

    raise RuntimeError(
        f"All Ollama hosts unreachable or models unavailable.\n"
        f"Tried hosts: {OLLAMA_HOSTS}\n"
        f"Tried models: {models_to_try}"
    )


def embed_one(text: str) -> tuple[list[float], str, int]:
    """Convenience wrapper for a single text."""
    vecs, model, dim = embed([text])
    return vecs[0], model, dim


def check_host(host: str) -> dict:
    """Return available models on a host."""
    try:
        req = urllib.request.Request(f"{host}/api/tags")
        with urllib.request.urlopen(req, timeout=5) as resp:
            data = json.loads(resp.read())
        models = [m["name"] for m in data.get("models", [])]
        return {"host": host, "reachable": True, "models": models}
    except Exception as e:
        return {"host": host, "reachable": False, "error": str(e)}


def status() -> dict:
    """Check all configured hosts."""
    return {"hosts": [check_host(h) for h in OLLAMA_HOSTS]}


if __name__ == "__main__":
    import sys
    if len(sys.argv) > 1 and sys.argv[1] == "status":
        import json as _json
        print(_json.dumps(status(), indent=2))
    else:
        text = " ".join(sys.argv[1:]) or "Hello from SITK.FS embedding test"
        vec, model, dim = embed_one(text)
        print(f"Model : {model}")
        print(f"Dims  : {dim}")
        print(f"Vector: [{vec[0]:.6f}, {vec[1]:.6f}, … {vec[-1]:.6f}]")
