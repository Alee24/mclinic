#!/bin/bash
cd /root/mclinic
git stash
git pull origin main
cd apps/api
npm install
npx prisma generate
npx prisma db push
npm run build
pm2 restart mclinic-api
cd ../web
npm install
npm run build
pm2 restart mclinic-web
pm2 save
pm2 status
