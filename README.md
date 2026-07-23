# Forest Glade monorepo

Forest Glade is a monorepo for the public website and sales/admin API for the Forest Glade apart-hotel project in Vrdnik.

## Architecture

- `apps/web` — Next.js public website and admin frontend.
- `apps/api` — Express API with Prisma, PostgreSQL, server-side sessions, CSRF, RBAC, audit logging, lead intake, and Cloudinary integration.
- `packages/project-data` — official source-governed apartment dataset shared by the API and frontend.

Official A1–A31 apartment code, floor, type, and market-area data must only be changed with an explicit source and audit reason. PGD is the primary source; catalogue data is secondary marketing material and must be marked for verification when it conflicts with PGD.

## Requirements

- Node.js `>=22 <23`
- npm `11.4.2`
- PostgreSQL for local API development
- Cloudinary account for media upload/import flows

## Local setup

```bash
npm ci
npm run build:project-data
npm run prisma:generate
```

Run the API and web app in separate terminals:

```bash
npm run dev:api
npm run dev:web
```

## Environment variables

Do not commit secrets. Configure environment variables through local `.env` files or platform secret managers.

Common API variables:

- `DATABASE_URL` — PostgreSQL connection string.
- `PORT` — API port, defaults to `10000` when configured that way by the platform.
- `CORS_ORIGIN` / allowed origins — frontend origins allowed to call the API.
- `ADMIN_BOOTSTRAP_TOKEN` — one-time bootstrap token; remove it after owner creation.
- `SESSION_COOKIE_NAME`, `SESSION_DAYS` — admin session settings.
- `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`, `CLOUDINARY_FOLDER` — Cloudinary configuration.
- SMTP variables for lead notifications.

## Database migrations

Generate the Prisma client:

```bash
npm run prisma:generate
```

Validate the Prisma schema:

```bash
npm run prisma:validate
```

Apply migrations in release/deploy steps, not in the main server command:

```bash
npm --workspace apps/api run release:migrate
```

## Official seed

The official apartment seed is a separate release operation:

```bash
npm --workspace apps/api run release:seed-official
```

It should be run deliberately and must not be coupled to every server start.

## Testing and checks

```bash
npm run format:check
npm run prisma:validate
npm run typecheck
npm run test
npm run check
npm run build
```

`npm run check` is the main local quality gate and runs formatting, Prisma validation, typechecks/lint, tests, and builds.

## Docker

Build the production API image:

```bash
docker build -t forestglade-api .
```

Smoke-test the runtime image:

```bash
docker run --rm forestglade-api node --version
```

The Dockerfile uses a multi-stage build, installs production dependencies separately, runs as a non-root user, exposes the API, and includes a `/health` healthcheck. Migrations and official seed are intentionally separate release commands.

## Render deploy

Use the Docker image for the API service. Configure all required environment variables in Render, then run release commands before starting a new version:

```bash
npm --workspace apps/api run release:migrate
npm --workspace apps/api run release:seed-official
npm --workspace apps/api run start
```

Only run the official seed when source-governed apartment fields need to be synchronized.

## Netlify deploy

Deploy `apps/web` as the frontend workspace. Configure public API base URL variables in Netlify and keep secrets out of frontend-exposed variables. The current frontend build is validated by:

```bash
npm run build:web
```

## Cloudinary configuration

Configure one Cloudinary folder namespace per environment, for example `forestglade-dev`, `forestglade-staging`, and `forestglade-production`. Store API secrets only in platform environment settings. Do not commit Cloudinary secrets, SMTP passwords, bootstrap tokens, or database URLs.
