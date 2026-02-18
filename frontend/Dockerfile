# ScanBit Frontend - Multi-stage build
# Build: npm run build | Serve: nginx
# Note: Avoid sensitive values in ARG (they can appear in image history). Use Docker build
# secrets (--secret) or runtime config where possible; Coolify injects build args at deploy.

FROM node:20-alpine AS builder
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
# API URL - override at build: --build-arg VITE_API_URL=https://server.scanbit.in/api
ARG VITE_API_URL=https://server.scanbit.in/api
ENV VITE_API_URL=$VITE_API_URL
RUN npm run build

FROM nginx:alpine
RUN apk add --no-cache curl
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://127.0.0.1:80/ || exit 1
CMD ["nginx", "-g", "daemon off;"]
