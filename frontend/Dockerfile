# Step 1: Build static assets
FROM node:22-alpine AS builder

WORKDIR /app

# Install dependencies first for better layer caching
COPY package.json package-lock.json ./
RUN npm ci

# Copy project files and build
COPY tsconfig.json vite.config.ts index.html ./
COPY src ./src
RUN npm run build

# Step 2: Serve with Nginx
FROM nginx:1.27-alpine AS runner

# Environment variables for Nginx template substitution
ENV BACKEND_HOST=backend \
    BACKEND_PORT=8080

# Remove default nginx static assets
RUN rm -rf /usr/share/nginx/html/*

# Copy built assets from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy custom Nginx configuration template (processed by docker-entrypoint with envsubst)
COPY nginx.conf.template /etc/nginx/templates/default.conf.template

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget -qO- http://localhost/healthz || exit 1

CMD ["nginx", "-g", "daemon off;"]
