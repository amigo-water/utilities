# Dockerfile for shared module - simplified version
# Build: docker build -f services/shared/Dockerfile -t utilities-shared:latest .

FROM node:22-alpine

# Install build dependencies
RUN apk add --no-cache python3 make g++ && \
    npm install -g typescript

# Set working directory
WORKDIR /app/services/shared

# Copy package files
COPY services/shared/package*.json ./

# Install dependencies (include dev dependencies for TypeScript)
RUN npm ci && npm cache clean --force

# Copy source code
COPY services/shared/ ./

# Build shared module if it has a build script (optional)
RUN npm run build || echo "No build script for shared, skipping..."

# This is for documentation - no CMD needed as this is meant to be used as a base image