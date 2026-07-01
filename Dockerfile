# Stage 1: Build the application
FROM node:lts-alpine AS builder
WORKDIR /app

# Install compilation tools required for native C++ bindings (better-sqlite3) on Alpine
RUN apk add --no-cache python3 make g++

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npm run build

# Remove development packages to keep production image light
RUN npm prune --production

# Stage 2: Production runner
FROM node:lts-alpine AS runner
WORKDIR /app

COPY --from=builder /app/package.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/build ./build

# Create directory to store persistent SQLite database cache
RUN mkdir -p /app/data && chown -R node:node /app/data

# Run container as a non-root user for security
USER node

# Expose server port and set environment variables
EXPOSE 3000
ENV PORT=3000
ENV HOST=0.0.0.0
ENV DATABASE_PATH=/app/data/weather_cache.db

CMD ["node", "build"]
