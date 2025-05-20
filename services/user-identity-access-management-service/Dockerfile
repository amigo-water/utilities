# Run from root dir - docker build -f services/user-identity-access-management-service/Dockerfile -t user-identity-access-management-service:001 .
# Stage 1: Build stage
FROM node:22-alpine AS builder

# Install build dependencies
RUN apk add --no-cache python3 make g++ && \
    npm install -g typescript

# Set working directory
WORKDIR /app

# Copy package files for dependency installation (shared first for better caching)
COPY services/shared/package*.json ./services/shared/
COPY services/user-identity-access-management-service/package*.json ./services/user-identity-access-management-service/

# Install dependencies
RUN cd services/shared && npm ci && npm cache clean --force
RUN cd services/user-identity-access-management-service && npm ci && npm cache clean --force

# Copy source code
COPY services/shared/ ./services/shared/
COPY services/user-identity-access-management-service/tsconfig.json ./services/user-identity-access-management-service/
COPY services/user-identity-access-management-service/src/ ./services/user-identity-access-management-service/src/

# Build the user-identity-access-management-service (this will also compile any shared dependencies due to tsconfig paths)
RUN cd services/user-identity-access-management-service && npm run build

# Stage 2: Production stage
FROM node:22-alpine AS runtime

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# Set working directory
WORKDIR /app

# Copy package files and install only production dependencies
COPY services/shared/package*.json ./services/shared/
COPY services/user-identity-access-management-service/package*.json ./services/user-identity-access-management-service/

RUN cd services/shared && npm ci --only=production && npm cache clean --force
RUN cd services/user-identity-access-management-service && npm ci --only=production && npm cache clean --force

# Copy the built application
COPY --from=builder --chown=nodejs:nodejs /app/dist/ ./dist/

# Copy shared source code (since it's referenced via tsconfig paths)
COPY --from=builder --chown=nodejs:nodejs /app/services/shared/src/ ./services/shared/src/

# Copy environment file
COPY services/user-identity-access-management-service/.env.dev ./services/user-identity-access-management-service/.env.dev

# Change ownership of the entire app directory
RUN chown -R nodejs:nodejs /app

# Switch to non-root user
USER nodejs

# Expose port 3010
EXPOSE 3010

# Add health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost:3010/health || exit 1

# Start the application
CMD ["node", "-r", "tsconfig-paths/register", "dist/services/user-identity-access-management-service/index.js"]