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
RUN pnpm build

# Production runner stage
FROM base AS runner
ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=3001

# Install production dependencies only
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --prod --frozen-lockfile

# Copy built application
COPY --from=builder /app/dist ./dist

# Expose port for the app
EXPOSE 3001

CMD ["node", "dist/server/server.js"]
