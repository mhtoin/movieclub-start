# Dockerfile
FROM node:23-alpine AS base
RUN corepack enable && corepack prepare pnpm@latest --activate
WORKDIR /app

# Dependencies stage
FROM base AS deps
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

# Builder stage
FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# Bake Vite public env vars into the client bundle at build time
ARG VITE_TMDB_API_KEY
ARG VITE_TMDB_BASE_URL
ARG VITE_TMDB_IMAGE_BASE_URL
ENV VITE_TMDB_API_KEY=$VITE_TMDB_API_KEY
ENV VITE_TMDB_BASE_URL=$VITE_TMDB_BASE_URL
ENV VITE_TMDB_IMAGE_BASE_URL=$VITE_TMDB_IMAGE_BASE_URL
ENV NODE_ENV=production
RUN pnpm build

# Production runner stage
FROM base AS runner
ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=3001

# Reuse node_modules from deps stage — no need to reinstall
COPY --from=deps /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./
COPY --from=builder /app/pnpm-lock.yaml ./

# Copy built application (Nitro output)
COPY --from=builder /app/.output ./.output

# Copy drizzle config, schema, migrations, and scripts for db operations
COPY --from=builder /app/drizzle.config.ts ./
COPY --from=builder /app/drizzle ./drizzle
COPY --from=builder /app/src/db ./src/db
COPY --from=builder /app/scripts ./scripts

# Expose port for the app
EXPOSE 3001

# Start the Nitro server
CMD ["node", ".output/server/index.mjs"]
