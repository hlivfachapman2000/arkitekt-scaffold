#!/usr/bin/env python3
"""
Sync verified memories from the Knowledge Vault and agent files to Qdrant.

Collections:
  agent_memory    — MEMORY.md content from each agent (4096 dims, qwen3-embedding:8b)
  knowledge_vault — 06__KNOWLEDGE_VAULT markdown files
  agent_kanban    — KANBAN.md tasks (for semantic task search)

Usage:
  python sync_to_qdrant.py                 # sync everything
  python sync_to_qdrant.py --agents        # agents only
  python sync_to_qdrant.py --vault         # knowledge vault only
  python sync_to_qdrant.py --dry-run       # print what would be synced, no writes
"""
import os
import sys
import json
import hashlib
import urllib.request
import urllib.error
from datetime import datetime
from pathlib import Path

# ── Paths ─────────────────────────────────────────────────────────────────────
ROOT         = Path(__file__).parent.parent.parent
AGENTS_DIR   = ROOT / "05__AGENTS"
VAULT_DIR    = ROOT / "06__KNOWLEDGE_VAULT"

# ── Config ────────────────────────────────────────────────────────────────────
QDRANT_URL   = os.environ.get("QDRANT_URL",    "http://localhost:6333")
QDRANT_KEY   = os.environ.get("QDRANT_API_KEY", "")
DRY_RUN      = "--dry-run" in sys.argv
SYNC_AGENTS  = "--agents" in sys.argv or not any(a.startswith("--") for a in sys.argv[1:])
SYNC_VAULT   = "--vault"  in sys.argv or not any(a.startswith("--") for a in sys.argv[1:])


# ── Helpers ───────────────────────────────────────────────────────────────────
def _qdrant(method: str, path: str, body: dict | None = None) -> dict:
    url  = f"{QDRANT_URL}{path}"
    data = json.dumps(body).encode() if body else None
    headers = {"Content-Type": "application/json"}
    if QDRANT_KEY:
        headers["api-key"] = QDRANT_KEY
    req = urllib.request.Request(url, data=data, headers=headers, method=method)
    try:
        with urllib.request.urlopen(req, timeout=15) as r:
            return json.loads(r.read())
    except urllib.error.HTTPError as e:
        return {"error": e.read().decode()}


def _sha(text: str) -> str:
    return hashlib.sha256(text.encode()).hexdigest()[:16]


def ensure_collection(name: str, dim: int) -> None:
    existing = _qdrant("GET", f"/collections/{name}")
    if "error" in existing or existing.get("status", {}).get("error"):
        print(f"  [qdrant] creating collection '{name}' ({dim} dims)…")
        if not DRY_RUN:
            _qdrant("PUT", f"/collections/{name}", {
                "vectors": {"size": dim, "distance": "Cosine"}
            })
    else:
        print(f"  [qdrant] collection '{name}' already exists ✓")


def upsert_points(collection: str, points: list[dict]) -> None:
    if DRY_RUN:
        print(f"  [dry-run] would upsert {len(points)} points → {collection}")
        return
    result = _qdrant("PUT", f"/collections/{collection}/points", {"points": points})
    if "error" in result:
        print(f"  [qdrant] ERROR: {result['error']}")
    else:
        print(f"  [qdrant] upserted {len(points)} points → {collection}")


# ── Embed (lazy import so errors are clear) ───────────────────────────────────
def get_embeddings(texts: list[str]) -> tuple[list[list[float]], str, int]:
    sys.path.insert(0, str(Path(__file__).parent))
    from embed import embed  # type: ignore
    return embed(texts)


# ── Agent memory sync ─────────────────────────────────────────────────────────
def sync_agents() -> None:
    print("\n── Agent Memory Sync ────────────────────────────────────────────")
    entries: list[tuple[str, str, dict]] = []   # (id, text, payload)

    for agent_dir in sorted(AGENTS_DIR.iterdir()):
        if not agent_dir.is_dir():
            continue
        agent_name = agent_dir.name

        for fname in ["MEMORY.md", "IDENTITY.md", "KANBAN.md"]:
            fpath = agent_dir / fname
            if not fpath.exists():
                continue
            text = fpath.read_text(encoding="utf-8").strip()
            if len(text) < 30:
                continue

            point_id = _sha(f"{agent_name}:{fname}")
            entries.append((point_id, text, {
                "agent": agent_name,
                "file":  fname,
                "path":  str(fpath.relative_to(ROOT)),
                "synced_at": datetime.utcnow().isoformat(),
            }))
            print(f"  queued  {agent_name}/{fname}  ({len(text)} chars)")

    if not entries:
        print("  nothing to sync")
        return

    texts = [e[1] for e in entries]
    print(f"\n  embedding {len(texts)} documents…")
    try:
        vecs, model, dim = get_embeddings(texts)
    except RuntimeError as e:
        print(f"  ✗ embedding failed: {e}")
        return

    print(f"  model={model}  dim={dim}")
    ensure_collection("agent_memory", dim)

    points = [
        {"id": _sha(entries[i][0]), "vector": vecs[i], "payload": entries[i][2]}
        for i in range(len(entries))
    ]
    upsert_points("agent_memory", points)


# ── Knowledge vault sync ──────────────────────────────────────────────────────
def sync_vault() -> None:
    print("\n── Knowledge Vault Sync ────────────────────────────────────────")
    entries: list[tuple[str, str, dict]] = []

    for md_file in sorted(VAULT_DIR.rglob("*.md")):
        text = md_file.read_text(encoding="utf-8").strip()
        if len(text) < 50:
            continue
        rel = str(md_file.relative_to(ROOT))
        entries.append((_sha(rel), text[:8000], {   # cap at ~8K chars
            "path":      rel,
            "filename":  md_file.name,
            "section":   md_file.parent.name,
            "synced_at": datetime.utcnow().isoformat(),
        }))
        print(f"  queued  {rel}  ({len(text)} chars)")

    if not entries:
        print("  nothing to sync")
        return

    texts = [e[1] for e in entries]
    print(f"\n  embedding {len(texts)} documents…")
    try:
        vecs, model, dim = get_embeddings(texts)
    except RuntimeError as e:
        print(f"  ✗ embedding failed: {e}")
        return

    print(f"  model={model}  dim={dim}")
    ensure_collection("knowledge_vault", dim)

    points = [
        {"id": _sha(entries[i][0]), "vector": vecs[i], "payload": entries[i][2]}
        for i in range(len(entries))
    ]
    upsert_points("knowledge_vault", points)


# ── Semantic search helper ────────────────────────────────────────────────────
def search(query: str, collection: str = "agent_memory", top_k: int = 5) -> list[dict]:
    """Semantic search across a Qdrant collection."""
    sys.path.insert(0, str(Path(__file__).parent))
    from embed import embed_one  # type: ignore
    vec, _, _ = embed_one(query)
    result = _qdrant("POST", f"/collections/{collection}/points/search", {
        "vector": vec,
        "limit":  top_k,
        "with_payload": True,
    })
    return result.get("result", [])


# ── Main ─────────────────────────────────────────────────────────────────────
if __name__ == "__main__":
    ts = datetime.now().isoformat(timespec="seconds")
    print(f"[{ts}] SITK.FS — Memory Bridge → Qdrant")
    print(f"  Qdrant : {QDRANT_URL}")
    print(f"  Dry run: {DRY_RUN}")

    if "--search" in sys.argv:
        idx = sys.argv.index("--search")
        q   = " ".join(sys.argv[idx + 1:]) if idx + 1 < len(sys.argv) else "agent capabilities"
        print(f"\nSearching: '{q}'")
        hits = search(q)
        for h in hits:
            print(f"  score={h['score']:.4f}  {h['payload'].get('path','?')}")
        sys.exit(0)

    if SYNC_AGENTS:
        sync_agents()
    if SYNC_VAULT:
        sync_vault()

    print(f"\n✅ Done — {datetime.now().isoformat(timespec='seconds')}")
