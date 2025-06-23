# --- Base image ---
FROM node:20-alpine AS base
WORKDIR /app

# --- Dependencies ---
FROM base AS deps
COPY package.json package-lock.json ./
RUN npm ci

# --- Build image ---
FROM deps AS build
COPY . .
RUN npm run build

# --- Development image ---
FROM deps AS dev
ENV NODE_ENV=development
COPY . .
EXPOSE 3000
CMD ["npm", "run", "dev"]

# --- Production image ---
FROM base AS prod
COPY --from=deps /app/node_modules ./node_modules
COPY --from=build /app/.output ./.output
COPY package.json ./
EXPOSE 3000
CMD ["node", ".output/server/index.mjs"]