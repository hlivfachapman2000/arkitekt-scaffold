#!/usr/bin/env python3
"""Parse Knowledge Vault markdown files into structured memory."""
import os
import re
import sqlite3
from datetime import datetime

VAULT_PATH = os.path.join(os.path.dirname(__file__), "../../06__KNOWLEDGE_VAULT")
DB_PATH = os.path.join(os.path.dirname(__file__), "../SQLITE/agent_state.db")

FM_RE = re.compile(r'^---\s*\n(.*?)\n---\s*\n', re.DOTALL)

def parse_frontmatter(content):
    m = FM_RE.match(content)
    if not m:
        return {}
    raw = m.group(1)
    meta = {}
    for line in raw.splitlines():
        if ':' in line:
            k, v = line.split(':', 1)
            meta[k.strip()] = v.strip()
    return meta

def sync():
    print(f"[{datetime.now().isoformat()}] Syncing vault to memory DB...")
    # TODO: implement recursive vault parsing + upsert to SQLite
    print("✅ Vault sync complete (stub)")

if __name__ == "__main__":
    sync()
