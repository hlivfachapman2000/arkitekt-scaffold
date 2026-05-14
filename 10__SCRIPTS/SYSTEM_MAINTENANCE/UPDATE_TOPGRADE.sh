#!/bin/bash
# ═══════════════════════════════════════════════════════════════
# ARKITEKT TOPGRADE WRAPPER
# Uses topgrade (cargo install topgrade) for unified updates
# Fallback to custom scripts if topgrade not available
# ═══════════════════════════════════════════════════════════════

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
LOG_DIR="$SCRIPT_DIR/logs/$(date +%Y-%m)"
mkdir -p "$LOG_DIR"
LOG_FILE="$LOG_DIR/topgrade_$(date +%Y-%m-%d_%H-%M-%S).log"

BLUE='\033[0;34m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${BLUE}╔═══════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║${NC}     🚀 ${GREEN}ARKITEKT TOPGRADE WRAPPER${NC}                            ${BLUE}║${NC}"
echo -e "${BLUE}╚═══════════════════════════════════════════════════════════════╝${NC}"
echo ""

# Check if topgrade is installed
if command -v topgrade &> /dev/null; then
    echo -e "${GREEN}✅ Topgrade found: $(topgrade --version)${NC}"
    echo -e "${BLUE}🚀 Running topgrade with arkitekt config...${NC}"

    topgrade \
        --config "$SCRIPT_DIR/topgrade.toml" \
        --yes \
        --cleanup \
        2>&1 | tee "$LOG_FILE"

    echo ""
    echo -e "${GREEN}✅ Topgrade complete${NC}"
else
    echo -e "${YELLOW}⚠️  Topgrade not found${NC}"
    echo -e "${BLUE}🔧 Installing topgrade via cargo...${NC}"

    if command -v cargo &> /dev/null; then
        cargo install topgrade
        echo -e "${GREEN}✅ Topgrade installed. Please re-run this script.${NC}"
    else
        echo -e "${RED}❌ Cargo not found. Cannot install topgrade.${NC}"
        echo -e "${YELLOW}🔄 Falling back to custom UPDATE_ALL.sh...${NC}"
        bash "$SCRIPT_DIR/UPDATE_ALL.sh"
        exit 0
    fi
fi

echo ""
echo -e "${BLUE}📄 Log: $LOG_FILE${NC}"

# Auto-archive old logs
find "$SCRIPT_DIR/logs" -name "*.log" -mtime +30 -delete 2>/dev/null || true
