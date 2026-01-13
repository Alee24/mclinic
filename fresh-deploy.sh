#!/bin/bash
set -e

echo "=============================================="
echo "    M-CLINIC FRESH DEPLOYMENT SCRIPT"
echo "=============================================="

# 1. Reset Codebase
echo "🔄 1. Refreshing Codebase..."
echo "   - Fetching latest origin..."
git fetch origin
echo "   - Resetting logic to origin/main..."
git reset --hard origin/main
echo "   - Cleaning untracked files..."
git clean -fd

echo "✅ Codebase is now a clean copy of origin/main."

# 2. Make sure deploy script is executable (just in case git reset changed permissions or it wasn't tracked)
chmod +x deploy-portal.sh

# 3. Run the main deployment script
echo "🚀 2. Launching deploy-portal.sh..."
./deploy-portal.sh
