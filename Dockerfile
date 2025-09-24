# --- Base image ---
FROM node:20-alpine AS base
RUN mkdir -p /app
WORKDIR /app

# --- Builder ---
FROM base AS builder
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
ENV NODE_ENV=production
RUN npm run build

# --- Production runtime ---
FROM base AS runner
ENV NODE_ENV=production
# Install only production deps
COPY package.json package-lock.json ./
RUN npm ci --omit=dev
# Copy built output from builder
COPY --from=builder /app/.output ./.output
EXPOSE 3000
USER node
CMD ["node", ".output/server/index.mjs"]