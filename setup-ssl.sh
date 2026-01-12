#!/bin/bash

# Check if running as root
if [ "$EUID" -ne 0 ]; then
  echo "Please run as root (sudo ./setup-ssl.sh)"
  exit
fi

echo "🔒 Setting up SSL for portal.mclinic.co.ke..."

# Install Certbot if missing
if ! command -v certbot &> /dev/null; then
    echo "Installing Certbot..."
    apt-get update
    apt-get install -y certbot python3-certbot-apache
fi

# Run Certbot
echo "Starting Certbot..."
certbot --apache -d portal.mclinic.co.ke

echo "✅ SSL Setup Complete (if no errors above)."
echo "Don't forget to implement auto-renewal: certbot renew --dry-run"
