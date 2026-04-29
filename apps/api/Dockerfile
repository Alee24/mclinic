# Base image for building
FROM node:20-alpine AS builder

WORKDIR /app

# Copy dependency files
COPY package*.json ./
COPY apps/api/package*.json ./apps/api/

# Install dependencies (including those in workspaces)
RUN npm install

# Copy source code
COPY . .

# Build the application
RUN npm run build -w api

# Final production image
FROM node:20-alpine

WORKDIR /app

# Create uploads directory (needed for static file serving)
RUN mkdir -p apps/api/uploads

# Copy built files and node_modules from builder
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/apps/api/package*.json ./apps/api/
COPY --from=builder /app/apps/api/dist ./apps/api/dist
COPY --from=builder /app/apps/api/.env* ./apps/api/

WORKDIR /app/apps/api

# Set default production environment
ENV NODE_ENV=production
ENV PORT=7899

EXPOSE 7899

# Start the application
CMD ["node", "dist/main"]
