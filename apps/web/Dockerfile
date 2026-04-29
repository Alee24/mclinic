# Base image for building
FROM node:20-alpine AS builder

WORKDIR /app

# Copy dependency files
COPY package*.json ./
COPY apps/web/package*.json ./apps/web/

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Build the application
# Note: NEXT_PUBLIC_API_URL should be available at build time
ARG NEXT_PUBLIC_API_URL=https://portal.mclinic.co.ke/api
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL

RUN npm run build -w web

# Final production image
FROM node:20-alpine

WORKDIR /app

# Copy built files and node_modules
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/apps/web/package*.json ./apps/web/
COPY --from=builder /app/apps/web/.next ./apps/web/.next
COPY --from=builder /app/apps/web/public ./apps/web/public
COPY --from=builder /app/apps/web/next.config.ts ./apps/web/

WORKDIR /app/apps/web

# Set default production environment
ENV NODE_ENV=production
ENV PORT=5054

EXPOSE 5054

# Start the application
CMD ["npm", "start", "--", "-p", "5054"]
