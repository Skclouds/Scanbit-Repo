# ScanBit Backend - Node.js API
# Coolify-compatible production image

FROM node:20-alpine AS base

# Install dumb-init and curl for healthchecks
RUN apk add --no-cache dumb-init curl

WORKDIR /app

# Copy dependency manifests
COPY package.json package-lock.json ./

# Install production dependencies only
RUN npm ci --omit=dev && npm cache clean --force

# Copy application code
COPY . .

# Ensure node user owns all files (node_modules was created as root)
RUN chown -R node:node /app

# Run as non-root user (node user exists in official node alpine image)
USER node

EXPOSE 5000

# Use dumb-init as PID 1 for graceful shutdown
ENTRYPOINT ["dumb-init", "--"]

# PORT is configurable via environment (Coolify injects at runtime)
HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD ["/bin/sh", "-c", "curl -f http://127.0.0.1:${PORT:-5000}/api/health || exit 1"]
CMD ["node", "server.js"]
