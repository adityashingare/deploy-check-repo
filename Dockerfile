# ==============================================================================
# BLFA Learning Lab - Next.js Frontend Dockerfile
# ==============================================================================
# Multi-stage production Dockerfile adhering to security and performance best practices.
# Stages:
#   1. deps     - Installs reproducible dependencies from package-lock.json
#   2. builder  - Compiles the Next.js application into a minimal standalone bundle
#   3. runner   - Minimal lightweight Node.js runtime executing as a non-root user
# ==============================================================================

# ------------------------------------------------------------------------------
# Stage 1: Dependencies Cache
# ------------------------------------------------------------------------------
FROM node:20-alpine AS deps
WORKDIR /app

# Install libc6-compat if needed by some native modules on Alpine
RUN apk add --no-cache libc6-compat

# Copy lockfile and package configuration for isolated dependency caching
COPY package.json package-lock.json ./

# Install exact dependencies reproducibly using npm ci
RUN npm ci

# ------------------------------------------------------------------------------
# Stage 2: Application Builder
# ------------------------------------------------------------------------------
FROM node:20-alpine AS builder
WORKDIR /app

# Copy cached dependencies from the deps stage
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build Arguments & Public Environment Variables:
# Next.js embeds NEXT_PUBLIC_* variables into the client-side JavaScript bundle at BUILD time.
# NEVER pass sensitive API keys, secrets, or database passwords as build arguments.
ARG NEXT_PUBLIC_WORDPRESS_API_URL=http://localhost:9000/graphql
ENV NEXT_PUBLIC_WORDPRESS_API_URL=${NEXT_PUBLIC_WORDPRESS_API_URL}

# Internal Docker URL used by Next.js Server Components / SSR fetch during build (if any)
ARG WORDPRESS_INTERNAL_API_URL=http://nginx/graphql
ENV WORDPRESS_INTERNAL_API_URL=${WORDPRESS_INTERNAL_API_URL}

# Disable Next.js telemetry collection during build for privacy and faster builds
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production

# Compile Next.js application (generates .next/standalone via next.config.mjs)
RUN npm run build

# ------------------------------------------------------------------------------
# Stage 3: Minimal Production Runtime
# ------------------------------------------------------------------------------
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Default runtime port
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Security: Create and run as an unprivileged, non-root user (nextjs:nodejs)
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Copy static assets and standalone server bundle from builder stage
COPY --from=builder /app/public ./public 2>/dev/null || true
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Switch to the non-root user for runtime execution
USER nextjs

# Expose Next.js server port
EXPOSE 3000

# Health check to ensure the container is responding to requests
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/api/health || exit 1

# Launch the standalone Next.js production server
CMD ["node", "server.js"]
