FROM node:22-slim

WORKDIR /app

RUN apt-get update -y \
  && apt-get install -y openssl ca-certificates \
  && rm -rf /var/lib/apt/lists/*

COPY package.json package-lock.json ./
COPY apps/api/package.json ./apps/api/package.json
COPY apps/web/package.json ./apps/web/package.json
COPY apps/api/prisma ./apps/api/prisma

RUN npm ci --include=dev

COPY . .

RUN npm --workspace packages/project-data run build
RUN npm --workspace apps/api run prisma:generate
RUN npm --workspace apps/api run build

EXPOSE 10000

CMD ["sh", "-c", "npm --workspace apps/api run start:migrate"]
