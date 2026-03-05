#!/bin/bash
# ═══════════════════════════════════════════════════════════════
# Theo Panel — Deploy Script
# ═══════════════════════════════════════════════════════════════
# Usage:
#   1. Copy project to VPS:
#      rsync -avz --exclude node_modules --exclude dist theo-panel/ root@VPS_IP:/opt/theo-panel/
#
#   2. SSH into VPS:
#      ssh root@VPS_IP
#
#   3. Configure environment:
#      cd /opt/theo-panel
#      cp .env.example .env
#      nano .env   # Set your OPENROUTER_API_KEY
#
#   4. Run this script:
#      chmod +x deploy.sh
#      ./deploy.sh
# ═══════════════════════════════════════════════════════════════

set -e

echo "╔═══════════════════════════════════════════╗"
echo "║     THEO PANEL — Deploy                   ║"
echo "╚═══════════════════════════════════════════╝"

# Check .env exists
if [ ! -f .env ]; then
    echo "❌ .env file not found!"
    echo "   Run: cp .env.example .env && nano .env"
    exit 1
fi

# Check Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker not found. Installing..."
    curl -fsSL https://get.docker.com | sh
fi

# Check Docker Compose
if ! docker compose version &> /dev/null; then
    echo "❌ Docker Compose not found."
    exit 1
fi

# Build and start
echo "🔨 Building containers..."
docker compose build --no-cache

echo "🚀 Starting services..."
docker compose up -d

echo ""
echo "✅ Deploy complete!"
echo ""
echo "   Panel:  http://$(hostname -I | awk '{print $1}')"
echo "   API:    http://$(hostname -I | awk '{print $1}')/api/health"
echo ""
echo "   Logs:   docker compose logs -f"
echo "   Stop:   docker compose down"
echo ""
