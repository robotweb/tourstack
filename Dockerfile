# --- Base image ---
FROM node:20-alpine AS base
WORKDIR /app
ENV NODE_ENV=production

# --- Dependencies ---
FROM base AS deps
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile

# --- Build image ---
FROM deps AS build
COPY . .
RUN yarn build

# --- Development image ---
FROM deps AS dev
ENV NODE_ENV=development
COPY . .
EXPOSE 3000
CMD ["yarn", "dev"]

# --- Production image ---
FROM base AS prod
COPY --from=deps /app/node_modules ./node_modules
COPY --from=build /app/.output ./.output
COPY package.json ./
EXPOSE 3000
USER node
CMD ["node", ".output/server/index.mjs"]