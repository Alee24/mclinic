#!/bin/bash

# Navigate to API root
cd /var/www/mclinicportal/apps/api

# Install Prisma dependencies
echo "Installing Prisma..."
npm install -D prisma
npm install @prisma/client

# Create .env for Prisma if not exists (Append URL)
if ! grep -q "DATABASE_URL" .env; then
  echo "" >> .env
  echo "DATABASE_URL=\"mysql://m-cl-app:Mclinic@App2023?@localhost:3306/mclinic\"" >> .env
  echo "Added DATABASE_URL to .env"
fi

# Reset DB via Prisma (Drops and recreates schema cleanly)
echo "Pushing Prisma Schema..."
npx prisma db push

echo "Generating Prisma Client..."
npx prisma generate

# Create Admin User (Using the SQL connection script since app is offline)
cd /var/www/mclinicportal
echo "Creating Admin User..."
node create-admin.js

echo "✅ Prisma setup complete! Database is ready."
