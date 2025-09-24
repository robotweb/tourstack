# Use Node 18 which has better compatibility with native modules
FROM node:18-bookworm-slim AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --ignore-scripts

# Build stage
FROM node:18-bookworm-slim AS builder
WORKDIR /app
COPY . .
COPY --from=deps /app/node_modules ./node_modules
# Set environment to avoid native binding issues
ENV NODE_OPTIONS="--max-old-space-size=4096"
RUN npm run build

# Runtime stage
FROM node:18-bookworm-slim AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY package.json package-lock.json ./
RUN npm ci --omit=dev --ignore-scripts
COPY --from=builder /app/.output ./.output
EXPOSE 3000
USER node
CMD ["node", ".output/server/index.mjs"]