#!/usr/bin/env python3
"""
CLAW3D — Agent Communication Visualizer
Generates interactive D3.js graphs of agent message flows.
Usage: python3 visualizer.py [--serve] [--port 8080]
"""
import argparse
import http.server
import os
import socketserver
import subprocess
import sys
import webbrowser
from pathlib import Path

SCRIPT_DIR = Path(__file__).parent
PROJECT_ROOT = SCRIPT_DIR.parent.parent

def build_graph(date=None):
    """Run log parser and build output.json."""
    parser_path = SCRIPT_DIR / "log_parser.py"
    output_dir = SCRIPT_DIR / "output"
    output_dir.mkdir(parents=True, exist_ok=True)

    cmd = [
        sys.executable, str(parser_path),
        "--project-root", str(PROJECT_ROOT),
        "--output", "output.json"
    ]
    if date:
        cmd.extend(["--date", date])

    print("🕸️  CLAW3D: Parsing communication logs...")
    result = subprocess.run(cmd, capture_output=True, text=True)
    print(result.stdout)
    if result.returncode != 0:
        print(result.stderr, file=sys.stderr)
        sys.exit(1)

    # Copy HTML template to output
    html_src = SCRIPT_DIR / "templates" / "network_graph.html"
    html_dst = output_dir / "network_graph.html"
    if html_src.exists():
        with open(html_src, 'r') as f:
            content = f.read()
        with open(html_dst, 'w') as f:
            f.write(content)
        print(f"📄 HTML template copied to {html_dst}")

def serve(port=8080):
    """Serve the visualization via HTTP."""
    output_dir = SCRIPT_DIR / "output"
    os.chdir(output_dir)

    handler = http.server.SimpleHTTPRequestHandler
    with socketserver.TCPServer(("", port), handler) as httpd:
        url = f"http://localhost:{port}/network_graph.html"
        print(f"🚀 Serving CLAW3D at {url}")
        webbrowser.open(url)
        httpd.serve_forever()

def main():
    parser = argparse.ArgumentParser(description="CLAW3D Agent Network Visualizer")
    parser.add_argument("--date", help="Specific date YYYY-MM-DD")
    parser.add_argument("--serve", action="store_true", help="Start HTTP server")
    parser.add_argument("--port", type=int, default=8080, help="Server port")
    args = parser.parse_args()

    build_graph(args.date)

    if args.serve:
        serve(args.port)
    else:
        output_file = SCRIPT_DIR / "output" / "output.json"
        print(f"✅ Graph data written to {output_file}")
        print(f"   Open 10__SCRIPTS/CLAW3D/output/network_graph.html in a browser to view.")

if __name__ == "__main__":
    main()
