# --- Base image ---
FROM node:20-bookworm-slim AS base
RUN mkdir -p /app
WORKDIR /app

# --- Builder ---
FROM base AS builder
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
ENV NODE_ENV=production
# Force JS fallback for lightningcss during build to avoid native binary issues
ENV LIGHTNINGCSS_FORCE_JS=1
RUN npm run build

# --- Production runtime ---
FROM base AS runner
ENV NODE_ENV=production
WORKDIR /app
# Install only production deps (skip scripts to avoid running nuxt prepare)
COPY package.json package-lock.json ./
RUN npm ci --omit=dev --ignore-scripts
# Copy built output from builder
COPY --from=builder /app/.output ./.output
EXPOSE 3000
USER node
CMD ["node", ".output/server/index.mjs"]