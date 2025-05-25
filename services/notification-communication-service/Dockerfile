# docker build -f services/notification-communication-service/Dockerfile -t notification-communication-service:002 .
# docker run --network host --env-file .\services\notification-communication-service\.env.dev notification-communication-service:002
# ---------- Stage 1: Builder ----------
FROM node:22-alpine AS builder

RUN apk add --no-cache python3 make g++ && npm install -g typescript

WORKDIR /app

# Copy package files
COPY services/shared/package*.json ./services/shared/
COPY services/notification-communication-service/package*.json ./services/notification-communication-service/

# Install dependencies
RUN cd services/shared && npm ci && npm cache clean --force
RUN cd services/notification-communication-service && npm ci && npm install tsconfig-paths && npm cache clean --force

# Copy source files
COPY services/shared ./services/shared
COPY services/notification-communication-service/tsconfig.json ./services/notification-communication-service/
COPY services/notification-communication-service/src ./services/notification-communication-service/src

# Build
WORKDIR /app/services/shared
RUN npm run build

# Build
WORKDIR /app/services/notification-communication-service
RUN npm run build

# ---------- Stage 2: Runtime ----------
FROM node:22-alpine AS runtime

RUN addgroup -g 1001 -S nodejs && adduser -S nodejs -u 1001

WORKDIR /app/services/notification-communication-service

# Copy build output
COPY --from=builder --chown=nodejs:nodejs /app/services/notification-communication-service/dist ./dist
COPY --from=builder --chown=nodejs:nodejs /app/services/notification-communication-service/tsconfig.json ./tsconfig.json

# Copy shared code
COPY --from=builder --chown=nodejs:nodejs /app/services/shared /app/services/shared

# Copy package files and install runtime deps
COPY services/notification-communication-service/package*.json ./
RUN npm ci && npm install tsconfig-paths

USER nodejs

EXPOSE 3007

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost:3007/health || exit 1

CMD ["node", "-r", "tsconfig-paths/register", "dist/index.js"]