#!/bin/bash

# M-Clinic Service Stop Script

echo "========================================="
echo "Stopping M-Clinic Services"
echo "========================================="

# Stop PM2 processes
echo ">>> Stopping PM2 services..."
pm2 stop all

echo ""
echo "========================================="
echo "Service Status:"
echo "========================================="
pm2 status

echo ""
echo "Services stopped. Apache is still running."
echo ""
echo "To restart services, run:"
echo "  ./start-services.sh"
echo ""
echo "To completely remove services:"
echo "  pm2 delete all"
echo "========================================="
