#!/bin/bash
# Update Docker Images

set -euo pipefail

echo "🐳 Updating Docker images..."
docker images --format '{{.Repository}}:{{.Tag}}' | grep -v '<none>' | while read image; do
    docker pull "$image" 2>/dev/null || true
done
docker system prune -f
echo "✅ Docker updated."
