# Enterprise readiness baseline

## Assessment

The static-review baseline is **56/100 enterprise production readiness** and roughly
**70–72% functional coverage**. Forest Glade is a well-structured MVP+/pre-production
system, not yet an enterprise-grade production service. This score is a planning
baseline rather than a certification; it must be revised only with test and operational
evidence.

| Area                                         | Baseline |
| -------------------------------------------- | -------: |
| Monorepo architecture and official data      |      86% |
| Backend functionality                        |      68% |
| Cloudinary and media pipeline                |      72% |
| Public frontend                              |      64% |
| Admin frontend                               |      55% |
| Security and access control                  |      48% |
| Tests and QA automation                      |      18% |
| CI/CD and Docker                             |      62% |
| Observability, backup, and disaster recovery |      24% |
| **Weighted total**                           |  **56%** |

## Existing foundations

- npm workspaces separate the Next.js web app, Express/Prisma API, and governed data.
- Server-side sessions, CSRF defenses, RBAC, audit logging, PostgreSQL, Docker, CI,
  lead intake, and Cloudinary upload/import paths already exist.
- A1–A31 official data is centralized in `packages/project-data` and governed by PGD.
- API application construction is separated from listener lifecycle, enabling future
  in-process integration tests.

## Evidence limitations

The original assessment was based on static analysis because dependency installation,
build, and runtime tests did not complete in its execution environment. A green command
with no API test files is not evidence that API behavior works. Readiness claims must
name the checkout, environment, command, result, and relevant artifact.

## Critical gaps and ordered roadmap

1. Stop password-hash and secret exposure in responses and audit records; fix bootstrap
   lifecycle, last-owner protection, critical session revocation, and field-level RBAC.
2. Establish API integration tests with PostgreSQL and deterministic mail/Cloudinary
   adapters, then validate all request and query contracts.
3. Add official-field lineage, typed settings, database constraints, and safe seeds.
4. Make media completion idempotent and observable; improve upload recovery and cleanup.
5. Decouple lead acceptance from SMTP with a transactional outbox and idempotency.
6. Complete users, rooms, leads, settings, audit, and media administration workflows.
7. Move public pages to an SSR/ISR-capable runtime and provide current SEO HTML.
8. Add the test pyramid, readiness checks, structured telemetry, alerts, backup restore
   exercises, separated environments, hardened delivery, and tested rollback.

## Baseline quality gates

Node.js 22 is the repository runtime. Run from a clean checkout:

```bash
npm ci
npm run format:check
npm run prisma:validate
npm run build:project-data
npm run typecheck
npm run lint:web
npm run test
npm run build
npm run verify:repository
docker build --build-arg VCS_REF=$(git rev-parse --short HEAD) -t forestglade-api .
```

`npm run check:fast` runs formatting, Prisma validation, both typechecks, and the test
suites for rapid feedback. A phase is complete only when its acceptance tests and all
applicable baseline gates pass; do not advance based on score estimates alone.

## Definition of enterprise acceptance

The system reaches 100% only after the documented security and RBAC guarantees, full
official-data lineage, reliable and idempotent leads/media, complete admin and public
flows, legal/privacy controls, PostgreSQL-backed integration and critical E2E tests,
coverage thresholds, database readiness and monitoring, successful backup restoration,
environment separation, tested rollback, Lighthouse scores of at least 90, and clean
checkout/Docker production checks are all evidenced.
