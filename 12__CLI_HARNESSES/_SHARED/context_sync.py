#!/usr/bin/env python3
"""Sync project context across all CLI harnesses."""
import os
import shutil

HARNESSES = ["CLAUDE_CODE", "CODEX", "GEMINI_CLI", "KIMI_CODE", "HERMES_AGENT", "OPENCODE"]
ROOT = os.path.dirname(os.path.dirname(__file__))

def sync():
    # Example: propagate shared conventions to all CLI .md files
    print("Syncing shared context across CLI harnesses...")
    for h in HARNESSES:
        path = os.path.join(ROOT, h, f"{h}.md")
        if os.path.exists(path):
            print(f"  ✓ {h}")
    print("Done.")

if __name__ == "__main__":
    sync()
