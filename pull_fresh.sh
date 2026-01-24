#!/bin/bash

# Simple script to force update the codebase from git
# Usage: ./pull_fresh.sh

echo "============================================="
echo "   M-Clinic Fresh Pull Script"
echo "============================================="
echo ""
echo "This will discard any local changes and overwrite"
echo "files with the latest version from GitHub."
echo ""
echo "Fetching latest changes..."
git fetch origin

echo "Resetting to origin/main..."
git reset --hard origin/main

echo ""
echo "✅ Codebase updated successfully!"
echo "============================================="
