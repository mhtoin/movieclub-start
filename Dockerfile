# Dockerfile
FROM node:20-alpine AS base
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
ARG VITE_ELECTRIC_URL
ARG VITE_ELECTRIC_SECRET
ARG VITE_TMDB_API_KEY
ARG VITE_TMDB_BASE_URL
ARG VITE_TMDB_IMAGE_BASE_URL
ENV VITE_ELECTRIC_URL=$VITE_ELECTRIC_URL
ENV VITE_ELECTRIC_SECRET=$VITE_ELECTRIC_SECRET
ENV VITE_TMDB_API_KEY=$VITE_TMDB_API_KEY
ENV VITE_TMDB_BASE_URL=$VITE_TMDB_BASE_URL
ENV VITE_TMDB_IMAGE_BASE_URL=$VITE_TMDB_IMAGE_BASE_URL
RUN pnpm build

# Production runner stage
FROM base AS runner
ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=3001

# Copy package files and install all dependencies (including drizzle-kit for migrations)
COPY --from=builder /app/package.json ./
COPY --from=builder /app/pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

# Copy built application (Nitro output)
COPY --from=builder /app/.output ./.output

# Copy drizzle config, schema, and migrations for db operations
COPY --from=builder /app/drizzle.config.ts ./
COPY --from=builder /app/drizzle ./drizzle
COPY --from=builder /app/src/db ./src/db

# Expose port for the app
EXPOSE 3001

# Start the Nitro server
CMD ["node", ".output/server/index.mjs"]
