# Use Ubuntu base for better native binding support
FROM node:20-bullseye-slim AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --ignore-scripts

# Build the app
FROM node:20-bullseye-slim AS builder
WORKDIR /app
COPY . .
COPY --from=deps /app/node_modules ./node_modules
RUN npm run build

# Production image, copy built assets and run
FROM node:20-bullseye-slim AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY package.json package-lock.json ./
RUN npm ci --omit=dev --ignore-scripts
COPY --from=builder /app/.output .output
EXPOSE 3000
CMD ["node", ".output/server/index.mjs"]