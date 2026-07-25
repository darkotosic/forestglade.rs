# Architecture

## System context

Forest Glade is an npm-workspaces monorepo with three deployable or shared areas:

- `apps/web` is the Next.js public site and browser-based administration interface.
- `apps/api` is the Express API. It owns authentication, authorization, lead intake,
  administration operations, audit records, PostgreSQL persistence through Prisma,
  email delivery, and Cloudinary integration.
- `packages/project-data` is the versioned, source-governed apartment dataset shared
  by the web and API workspaces. It is not a marketing-content store.

PostgreSQL is the operational system of record. Cloudinary stores media binaries;
the database stores their application metadata and apartment relationships. Platform
secret stores, rather than source control or site settings, own credentials.

## Runtime boundaries

The API composition root is `apps/api/src/app.ts`. `createApp()` configures middleware
and routes but never opens a socket, allowing tests to exercise the application in
process. `apps/api/src/server.ts` is the production entry point and owns only listener
startup, signal handling, graceful HTTP shutdown, and Prisma disconnection.

The web application currently uses Next.js static export. Consequently, live database
values loaded in the browser are not necessarily present in the initial public HTML.
This is a known pre-production limitation, not an SSR/ISR architecture claim.

## Data flow and ownership

1. PGD-derived A1–A31 identity and official measurements enter through the governed
   project-data package and deliberate official seed operation.
2. Prisma migrations own every database schema change; `prisma db push` is prohibited.
3. Admin changes pass through the API's session, CSRF, and RBAC controls and should
   produce an audit record.
4. Public pages obtain published commercial and media data from the public API.
5. Leads are written to PostgreSQL before the current synchronous mail notification.
   Decoupling notification through an outbox remains planned reliability work.

## Deployment model

The API has a multi-stage Docker build. Database migrations and the official seed are
explicit release operations and are not coupled to process startup. The frontend is
currently deployed separately as a static Next.js build. Development, staging, and
production must use distinct databases, Cloudinary folders, recipients, cookies, and
secrets.

## Current trust boundaries

- Browser input, query parameters, Cloudinary callbacks, and imported media metadata
  are untrusted at the API boundary.
- The catalogue is untrusted for official fields when it differs from PGD.
- Frontend environment variables are public and must never contain credentials.
- Audit data is operationally sensitive and must be sanitized before persistence.

See [source governance](source-governance.md) for official-data change control and
[enterprise readiness](enterprise-readiness.md) for the baseline and known gaps.
