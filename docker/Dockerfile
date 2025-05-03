FROM node:18-alpine AS base

FROM base AS builder

RUN npm install -g pnpm

WORKDIR /app
COPY package*.json pnpm-lock.yaml .npmrc ./
RUN pnpm install
COPY . .

# Next.js collects anonymous telemetry data about general usage, which we opt out from
# https://nextjs.org/telemetry
ENV NEXT_TELEMETRY_DISABLED 1

COPY ./.env .

RUN pnpm build

FROM base as prod
RUN mkdir /app
WORKDIR /app

# Next.js collects anonymous telemetry data about general usage, which we opt out from
# https://nextjs.org/telemetry
ENV NEXT_TELEMETRY_DISABLED 1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Automatically leverage output traces to reduce image size
# https://nextjs.org/docs/advanced-features/output-file-tracing
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# You only need to copy next.config.js if you are NOT using the default configuration
COPY --from=builder /app/next.config.js ./
COPY --from=builder /app/public ./public
COPY --from=builder /app/package.json ./package.json

EXPOSE 3000

ENV PORT 3000
CMD ["node", "server.js"]
