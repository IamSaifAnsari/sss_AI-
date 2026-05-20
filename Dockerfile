# Multi-stage build for the NeuronStack backend.
# Frontend is served separately (GitHub Pages).

FROM node:20-bookworm-slim AS deps
WORKDIR /app
COPY package.json package-lock.json ./
# Build tools for better-sqlite3 native module.
RUN apt-get update -y && apt-get install -y --no-install-recommends \
    python3 make g++ ca-certificates \
 && rm -rf /var/lib/apt/lists/* \
 && npm ci --omit=dev \
 && npm rebuild better-sqlite3

FROM node:20-bookworm-slim AS runtime
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3001
RUN apt-get update -y && apt-get install -y --no-install-recommends ca-certificates \
 && rm -rf /var/lib/apt/lists/*
COPY --from=deps /app/node_modules ./node_modules
COPY package.json ./
COPY server ./server
COPY .env.example ./.env.example
# Persistent data dir (mount a Render disk here in production).
RUN mkdir -p /app/data
EXPOSE 3001
CMD ["node", "server/index.js"]
