FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
COPY apps/web/package*.json ./apps/web/
RUN npm install
COPY . .
RUN cd apps/web && npm run build

FROM node:20-alpine
WORKDIR /app
COPY --from=builder /app/apps/web/public ./apps/web/public
COPY --from=builder /app/apps/web/.next ./apps/web/.next
COPY --from=builder /app/apps/web/node_modules ./apps/web/node_modules
COPY --from=builder /app/apps/web/package.json ./apps/web/package.json

EXPOSE 3000
ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

WORKDIR /app/apps/web
CMD ["npm", "run", "start"]
