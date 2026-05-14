#!/usr/bin/env python3
"""
CLAW3D — Agent Communication Log Parser
Parses _COMMUNICATION_LOGS/ into graph data for D3.js/Cytoscape visualizations.
Usage: python3 log_parser.py [--date YYYY-MM-DD] [--output output.json]
"""
import argparse
import json
import os
import re
import glob
from datetime import datetime
from collections import defaultdict

def parse_logs(base_dir, date=None):
    """Parse communication logs into nodes and edges."""
    nodes = {}
    edges = defaultdict(lambda: {"count": 0, "tokens": 0, "messages": []})

    log_dir = os.path.join(base_dir, "05__AGENTS", "_COMMUNICATION_LOGS")
    if not os.path.exists(log_dir):
        return {"nodes": [], "edges": []}

    # Determine which directories to scan
    if date:
        scan_dirs = [os.path.join(log_dir, date)]
    else:
        scan_dirs = sorted(glob.glob(os.path.join(log_dir, "*")))

    for day_dir in scan_dirs:
        if not os.path.isdir(day_dir):
            continue
        for log_file in glob.glob(os.path.join(day_dir, "*.md")):
            basename = os.path.basename(log_file)
            # Format: agent_A_to_agent_B.md or broadcast_events.md
            if basename == "broadcast_events.md":
                src = "broadcast"
                dst = "all"
            else:
                m = re.match(r'(.+?)_to_(.+?)\.md', basename)
                if m:
                    src, dst = m.groups()
                else:
                    continue

            # Ensure nodes exist
            if src != "broadcast":
                nodes.setdefault(src, {"id": src, "group": 1, "last_active": None})
            if dst != "all":
                nodes.setdefault(dst, {"id": dst, "group": 1, "last_active": None})

            # Parse file content
            with open(log_file, 'r') as f:
                content = f.read()

            # Count message blocks (each block starts with "---" and a timestamp)
            msg_count = content.count('**[')

            # Extract most recent timestamp if available
            ts_matches = re.findall(r'\*\*\[([^\]]+)\]', content)
            last_ts = ts_matches[-1] if ts_matches else None

            # Preserve directionality for edges (src -> dst)
            edge_key = (src, dst)
            edges[edge_key]["count"] += max(msg_count, 1)
            if last_ts:
                edges[edge_key]["last_active"] = last_ts
                if src in nodes:
                    nodes[src]["last_active"] = last_ts
                if dst in nodes:
                    nodes[dst]["last_active"] = last_ts

    # Convert to graph format
    graph_nodes = []
    for nid, data in nodes.items():
        # Calculate activity score based on recency
        graph_nodes.append({
            "id": nid,
            "group": data["group"],
            "last_active": data["last_active"]
        })

    graph_edges = []
    for (src, dst), data in edges.items():
        graph_edges.append({
            "source": src,
            "target": dst,
            "value": data["count"],
            "last_active": data.get("last_active")
        })

    return {
        "nodes": graph_nodes,
        "edges": graph_edges,
        "generated_at": datetime.now().isoformat(),
        "date_range": date or "all"
    }

def main():
    parser = argparse.ArgumentParser(description="CLAW3D Log Parser")
    parser.add_argument("--date", help="Specific date YYYY-MM-DD")
    parser.add_argument("--output", default="output.json", help="Output JSON file")
    parser.add_argument("--project-root", default=".", help="Project root directory")
    args = parser.parse_args()

    result = parse_logs(args.project_root, args.date)

    output_path = os.path.join(args.project_root, "10__SCRIPTS", "CLAW3D", "output", args.output)
    os.makedirs(os.path.dirname(output_path), exist_ok=True)

    with open(output_path, 'w') as f:
        json.dump(result, f, indent=2)

    print(f"✅ Parsed {len(result['nodes'])} nodes, {len(result['edges'])} edges")
    print(f"📄 Output: {output_path}")

if __name__ == "__main__":
    main()
