FROM node:22-slim AS base
WORKDIR /app
ENV NODE_ENV=production
RUN apt-get update -y \
  && apt-get install -y --no-install-recommends openssl ca-certificates \
  && rm -rf /var/lib/apt/lists/*

FROM base AS prod-deps
COPY package.json package-lock.json ./
COPY apps/api/package.json ./apps/api/package.json
COPY apps/web/package.json ./apps/web/package.json
COPY packages/project-data/package.json ./packages/project-data/package.json
COPY apps/api/prisma ./apps/api/prisma
RUN npm ci --omit=dev \
  && npm --workspace apps/api run prisma:generate \
  && npm cache clean --force

FROM base AS builder
ENV NODE_ENV=development
COPY package.json package-lock.json ./
COPY apps/api/package.json ./apps/api/package.json
COPY apps/web/package.json ./apps/web/package.json
COPY packages/project-data/package.json ./packages/project-data/package.json
COPY apps/api/prisma ./apps/api/prisma
RUN npm ci
COPY . .
RUN npm run build:project-data
RUN npm --workspace apps/api run build

FROM base AS runtime
COPY --from=prod-deps /app/node_modules ./node_modules
COPY --from=prod-deps /app/apps/api/node_modules ./apps/api/node_modules
COPY --from=prod-deps /app/packages/project-data/node_modules ./packages/project-data/node_modules
COPY --from=builder /app/apps/api/dist ./apps/api/dist
COPY --from=builder /app/apps/api/prisma ./apps/api/prisma
COPY --from=builder /app/packages/project-data/dist ./packages/project-data/dist
COPY package.json package-lock.json ./
COPY apps/api/package.json ./apps/api/package.json
COPY packages/project-data/package.json ./packages/project-data/package.json
RUN groupadd --system --gid 1001 nodejs \
  && useradd --system --uid 1001 --gid nodejs forestglade
USER forestglade
EXPOSE 10000
HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:' + (process.env.PORT || 10000) + '/health').then((r) => process.exit(r.ok ? 0 : 1)).catch(() => process.exit(1))"
CMD ["npm", "--workspace", "apps/api", "run", "start"]
