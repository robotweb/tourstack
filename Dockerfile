# --- Base image ---
FROM node:20-alpine AS base
RUN mkdir -p /app
WORKDIR /app

# --- Development image ---
FROM base AS dev
COPY package.json yarn.lock ./
RUN yarn install
ENV NODE_ENV=development
COPY . .
EXPOSE 3000
CMD ["yarn","dev"]

# --- Production image ---
FROM base AS prod
COPY . .
RUN yarn install
ENV NODE_ENV=production
RUN yarn build
EXPOSE 3000
USER node
CMD ["node", ".output/server/index.mjs"]