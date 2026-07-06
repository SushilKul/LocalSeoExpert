# LocalSEOExpert: MVP → Production-Ready Prompt Playbook

**Prepared for:** Sushil
**Target repo:** `LocalSeoExpert.zip`
**Method:** Sequential, phase-gated prompts for an agentic coding tool (Claude Code recommended; also works in Cursor/Windsurf with adjustments)

---

## 0. What I actually found in your repo (read this before prompting anything)

I unzipped and inspected the project directly — this isn't based on the README/PRD alone.

| Claimed (README/package.json) | Actually present in zip |
|---|---|
| `server/index.ts` entrypoint | **Missing** — no `server/` folder at all |
| `server/storage.ts` (imported by `routes.ts`) | **Missing** — `routes.ts` will not compile/run |
| `prisma/schema.prisma` | **Missing** — no schema file anywhere |
| `server/.env.example` | **Missing** |
| Prisma ORM (per README) | `package.json` has `@prisma/client` + `pg` + `connect-pg-simple` — looks like a Prisma→raw-pg migration was half-done |
| JWT auth | Present in `routes.ts`, but has a **hardcoded fallback secret** (`"postgres_is_awesome"`) if `JWT_SECRET` is unset — a real security bug |
| GBP data | Correctly mocked per PRD, in-memory/DB-backed via the missing `storage` module |
| `.env` | Committed to the zip with a local Postgres connection string — needs to be removed from version control and rotated |
| Docker / CI / Terraform | `Dockerfile`, `docker-compose.dev.yml`, `github/workflows/ci.yml`, `infra/main.tf` all exist as scaffolding — untested against the actual app since the app doesn't currently build |

**Implication:** This is not "polish an MVP" — it's "repair a partially-migrated MVP, then productionize it." Any prompt sequence must start with a repair/audit phase, or the AI will paper over the missing backend with invented assumptions.

---

## 1. Overall strategy

Don't send one mega-prompt saying "make this production ready." On a repo with structural gaps, that produces a confident agent that invents a `storage.ts` with wrong assumptions, silently drops the Prisma-vs-pg conflict, and ships something that looks done but isn't.

Instead, run **8 phases**, each a separate prompt, each gated on you reviewing the diff before moving to the next. This mirrors how a senior engineer would actually run this project.

```
Phase 0 → Repo audit & gap report (no code changes)
Phase 1 → Repair: reconstruct missing backend so it actually runs
Phase 2 → Data layer: pick ONE ORM, real schema, migrations, seed data
Phase 3 → Real integrations: Google Business Profile API (feature-flagged) + Maps Grounding Lite
Phase 4 → Security hardening
Phase 5 → Testing (unit + integration + e2e)
Phase 6 → Observability, logging, error handling
Phase 7 → CI/CD, containerization, IaC validation
Phase 8 → Production readiness review + launch checklist
```

Feed these **in order**, in **separate conversation turns** (or separate Claude Code sessions per phase for a clean context window). Always ask the tool to output a diff/summary + a list of open questions before you approve moving on.

---

## 2. Master context prompt (send once, before Phase 0)

Paste this first so the agent has full grounding before touching anything:

```
You are acting as a senior (15+ years) full-stack engineer and technical lead.
I'm handing you a partially-built MVP called "LocalSEOExpert" — a Local SEO /
Google Business Profile (GBP) management tool for SMBs and agencies. Stack:
React + TypeScript + Vite + TailwindCSS + shadcn/ui frontend, Node.js + Express
+ TypeScript backend, PostgreSQL database, JWT auth.

Ground truth documents are in /attached_assets:
- "Product Requirements Document (PRD) - GBP MVP.pdf/.docx" — the source of truth for scope
- "ASSUMPTIONS.md" — explicit MVP-stage assumptions already agreed
- "Local SEO Tool Development Research....docx" — background research

Read all three before forming opinions. Do not assume the README or
package.json scripts are accurate — verify every claim against the actual
file tree.

Your task across this engagement (I will prompt you phase by phase, do NOT
jump ahead): take this MVP from its current state to a fully production-ready,
deployable application. I will approve each phase before you start the next.

Ground rules for the whole engagement:
1. Never invent business logic that isn't in the PRD or that I haven't
   explicitly approved. If something is ambiguous, list it as an open
   question instead of guessing.
2. Every phase must end with: a summary of changes, a list of files
   touched, any new environment variables required, and open questions.
3. Do not silently fix things outside the current phase's scope — note them
   as "found but deferred to Phase N" instead.
4. Assume this will be deployed to a real cloud environment with real users
   and real (eventually) Google API credentials — treat all secrets,
   error handling, and data validation with production rigor from Phase 1
   onward, not as an afterthought in a later phase.
5. Prefer minimal, explicit, well-commented code over clever abstractions.

Start with Phase 0 only: a full repo audit. Do not write or fix any code yet.
```

---

## 3. Phase 0 — Repo audit & gap report

**Goal:** force the agent to build the same "what's real vs. what's claimed" picture you now have, in its own words, before it writes a line of code.

```
PHASE 0: AUDIT ONLY. Do not modify any files.

1. Walk the entire repo tree (excluding node_modules, .git) and produce a
   file-by-file inventory of: frontend (client/src), backend (routes.ts,
   setup.ts, any server/ files), config (package.json, tsconfig, vite config,
   tailwind config), infra (Dockerfile, docker-compose, github/workflows,
   infra/main.tf), and docs (attached_assets).

2. Cross-check package.json scripts and README instructions against what
   actually exists. Flag every mismatch (e.g. scripts referencing files or
   folders that don't exist, ORMs referenced in docs but not fully wired up,
   any import in routes.ts that resolves to a missing file).

3. Attempt to trace the request lifecycle for one endpoint (e.g. GET
   /api/locations) from route definition to data return. Identify every
   broken link in that chain.

4. Compare implemented features against the PRD's "Core Features" section
   (JWT Auth, GBP Location Management, GBP Review Management, GBP Post
   Management, Keyword Tracking, Dashboard/Insights, React Frontend
   Components). Mark each as: Fully implemented / Partially implemented /
   Stubbed only / Missing.

5. List every hardcoded secret, default credential, or insecure fallback
   (e.g. default JWT secret) you find.

6. Output a single markdown report: GAP_REPORT.md, with sections:
   File Inventory, Broken Imports/References, Feature Coverage vs PRD,
   Security Findings, Recommended Phase 1 Scope.

Do not proceed to fixing anything. Wait for my review of GAP_REPORT.md.
```

**Your job after Phase 0:** read `GAP_REPORT.md`, correct anything it got wrong, and only then move to Phase 1.

---

## 4. Phase 1 — Repair: make the MVP actually run

**Goal:** a working `npm run dev` and `npm run build` with the real feature set from the PRD, backed by a real (even if minimal) data layer — no more, no less than what Phase 0 confirmed was intended.

```
PHASE 1: REPAIR THE MVP TO A RUNNING STATE.

Using GAP_REPORT.md as your source of truth:

1. Reconstruct the missing server/ directory structure. Decide and document
   ONE data-access approach — either finish the Prisma migration (schema.prisma
   + generated client) or drop Prisma in favor of the raw `pg` + query-builder
   approach already partially present. Do not leave both half-wired. State
   your recommendation and reasoning before implementing (Prisma gives you
   type-safe migrations and is the better production default here — but tell
   me if you disagree and why).

2. Implement server/storage.ts (or equivalent data-access module) so every
   import in routes.ts resolves and every endpoint in api.yaml has a real,
   working implementation against Postgres — no in-memory stand-ins that
   silently reset on restart.

3. Fix package.json scripts so `npm run dev`, `npm run build`, `npm start`,
   and `npm run db:push`/migrate all actually work end-to-end. Update README
   if any commands change.

4. Remove the committed .env file from the repo; replace with a .env.example
   containing only variable names, no real values. Add .env to .gitignore
   if it isn't already excluded.

5. Verify the app runs locally end-to-end: register a user, log in, create a
   location, add a keyword, view the dashboard. Report the exact commands you
   ran and their output.

Output: a diff summary, updated README, list of any PRD features you could
NOT wire up and why, and open questions. Do not add new features not in the
PRD. Do not touch security hardening beyond what's needed to make auth work
correctly — that's Phase 4.
```

---

## 5. Phase 2 — Data layer: real schema, migrations, seed data

```
PHASE 2: PRODUCTION DATA LAYER.

1. Design a proper relational schema (users, accounts, locations, reviews,
   posts, photos, keywords, keyword_rank_history, dashboard_metrics) matching
   the PRD's data model implications and the fields already used in routes.ts
   (insertLocationSchema, insertPostSchema, insertPhotoSchema,
   insertKeywordSchema). Add appropriate foreign keys, indexes (especially on
   locationId, userId, and any field used for lookups/pagination), and
   timestamps.

2. Write migrations (Prisma migrate or node-pg-migrate, matching the Phase 1
   decision) — not just a `db push` schema sync. Migrations must be
   reversible and reviewable.

3. Write a seed script producing realistic mock GBP data per the PRD's
   "mocked" requirement: at least 5 locations, reviews with mixed
   ratings/reply states, a mix of published/scheduled posts, keywords with
   rank history over multiple weeks, so the dashboard has something
   meaningful to chart.

4. Add DB connection pooling config appropriate for production (max
   connections, idle timeout, SSL mode for managed Postgres like RDS/Neon/
   Supabase).

Output: schema file(s), migration files, seed script, and a short doc
explaining the entity relationships.
```

---

## 6. Phase 3 — Real integrations (Google APIs)

This is the phase where your Maps Grounding Lite link comes in — but scope it correctly.

```
PHASE 3: REAL GOOGLE INTEGRATIONS (FEATURE-FLAGGED).

Important distinction — implement both, but do not conflate them:

A) GOOGLE BUSINESS PROFILE API (the actual "unmock GBP" path)
   - This is what would replace the PRD's mocked locations/reviews/posts
     with real data, via OAuth2 (Google Business Profile API,
     mybusinessbusinessinformation / mybusinessaccountmanagement /
     mybusinessplaceactions scopes).
   - This API requires manual Google API access approval and is NOT
     available instantly — so implement it behind a
     GBP_INTEGRATION_ENABLED feature flag, defaulting to false/mocked.
   - Build: OAuth connect flow (server-side, storing refresh tokens
     encrypted at rest), a service layer (server/services/gbp.ts) with the
     same interface as the current mock storage layer, so the frontend and
     routes don't need to change — only the data source swaps.
   - When the flag is off, fall back to the existing mocked/seeded data
     with zero behavior change.

B) GOOGLE MAPS GROUNDING LITE (place enrichment / AI grounding — NOT the
   same as the Business Profile API)
   - Reference: https://developers.google.com/maps/ai/grounding-lite
   - Use this for: enriching a location's public presence with grounded
     place data (via the search_places tool / resolveNames REST endpoint),
     and any future AI-assisted features (e.g. "find nearby competitor
     locations", "suggest posts based on nearby search context").
   - It authenticates via an API key (X-Goog-Api-Key header) or OAuth
     against https://mapstools.googleapis.com/mcp, or the REST
     resolveNames/resolveMapsUrls endpoints for non-MCP use — use the plain
     REST endpoints here since we're a regular Express backend, not an
     MCP host.
   - Implement a thin server/services/mapsGrounding.ts wrapper around
     resolveNames, so a user typing a free-text business name/address can
     be resolved to a stable Google Place ID + lat/lng for storage.
   - Respect attribution requirements: if you ever surface grounded place
     data to end users, the Google Maps source/link must be shown
     immediately next to that content per Google's attribution guidelines
     (https://developers.google.com/maps/ai/grounding-lite/attribution) —
     flag this requirement in your output, don't just implement silently.
   - Add GOOGLE_MAPS_API_KEY to .env.example and validate at startup that
     it's present if this feature is enabled.

Output: both integrations behind flags, defaulting OFF in production until
I supply real credentials, a short doc on how to enable each, and explicit
notes on the attribution requirement.
```

---

## 7. Phase 4 — Security hardening

```
PHASE 4: SECURITY HARDENING FOR PRODUCTION.

1. Remove the hardcoded JWT secret fallback in routes.ts. The app must
   fail fast at startup if JWT_SECRET is missing in production
   (NODE_ENV=production).

2. Implement refresh tokens (the PRD marks this optional for MVP, but it's
   required for production — short-lived access token + longer-lived
   refresh token, refresh token rotation, revocation on logout).

3. Add rate limiting (express-rate-limit) on auth endpoints at minimum
   (login, register, password reset) and a sane global limit elsewhere.

4. Add helmet with a real CSP appropriate for the Vite-built frontend
   (report what headers you set and why).

5. Lock down CORS to explicit allowed origins via env var in production
   (currently open per ASSUMPTIONS.md — that's fine for dev, not for prod).

6. Add input validation via the existing zod schemas to ALL mutating
   endpoints (some may currently be missing validation on the route level).

7. Add password complexity rules and bcrypt cost factor appropriate for
   production (12+ rounds).

8. Run `npm audit` (and equivalent for client/) and resolve or explicitly
   document any high/critical vulnerabilities.

9. Ensure all secrets (DB creds, JWT secret, Google API keys) are read only
   from environment variables, never committed, and add a
   SECRETS_CHECKLIST.md documenting every required secret and where it's
   used.

Output: diff summary, updated .env.example, SECRETS_CHECKLIST.md, and
npm audit results.
```

---

## 8. Phase 5 — Testing

```
PHASE 5: TEST COVERAGE FOR PRODUCTION CONFIDENCE.

1. Unit tests (Vitest) for: auth (register/login/token validation/refresh),
   each storage/service module, keyword rank calculation logic, dashboard
   aggregation logic.

2. Integration tests (Supertest) for every endpoint in api.yaml — happy
   path + at least one failure path (missing auth, invalid input, not
   found) per endpoint.

3. Frontend tests (React Testing Library) for: login form validation,
   location list rendering, dashboard chart rendering with mock data.

4. A minimal e2e smoke test (Playwright or Cypress — pick one and justify)
   covering: register → login → create location → add keyword → view
   dashboard.

5. Wire coverage reporting into the existing `npm test`/`npm run coverage`
   scripts and set a minimum coverage threshold (propose one, e.g. 70%
   lines) that CI will enforce in Phase 7.

Output: test files, coverage report summary, and any bugs the tests
uncovered (fix only if trivial; otherwise log to BUGS_FOUND.md for my
review).
```

---

## 9. Phase 6 — Observability, logging, error handling

```
PHASE 6: PRODUCTION OBSERVABILITY.

1. Structured logging (pino or winston) replacing any console.log, with
   request IDs, and log levels driven by NODE_ENV.

2. Centralized Express error-handling middleware returning consistent
   error shapes (matching the Error schema already defined in api.yaml),
   never leaking stack traces in production responses.

3. Health check endpoint (/healthz) checking DB connectivity, suitable for
   the Docker/infra setup already in the repo.

4. Basic metrics (request count/duration, error rate) — propose a
   lightweight approach (e.g. prom-client) rather than a heavy APM unless
   I tell you we have budget for one.

5. Frontend error boundary + user-facing error states for failed API calls
   (currently likely missing/inconsistent across pages).

Output: diff summary and a short OBSERVABILITY.md explaining what's logged/
monitored and where to look when something breaks in production.
```

---

## 10. Phase 7 — CI/CD, containerization, IaC validation

```
PHASE 7: DEPLOYMENT PIPELINE VALIDATION.

1. Review and fix github/workflows/ci.yml so it actually reflects the
   Phase 1-6 changes (correct test command, coverage threshold gate, lint
   step, build step) and passes end-to-end against the real schema/migrations.

2. Review Dockerfile and docker-compose.dev.yml for correctness against the
   now-working app (multi-stage build, non-root user, correct EXPOSE port,
   migrations run on container start or via a separate release step —
   your call, justify it).

3. Review infra/main.tf — tell me what it currently provisions, what's
   missing for a real deployment (e.g. managed Postgres, secrets manager
   entries for JWT_SECRET/GOOGLE_MAPS_API_KEY, load balancer/health check
   wiring), and what I'd need to fill in (cloud provider account, DNS,
   etc.) before `terraform apply` would work. Do not apply anything — I
   don't want live infrastructure created without my explicit say-so.

4. Add a CD stage (or document a manual deploy runbook if I'm not ready for
   full CD) covering: build → run migrations → deploy → smoke test.

Output: diff summary, DEPLOYMENT_RUNBOOK.md, and an explicit list of
external accounts/credentials I need to provision before this can go live
(cloud provider, managed Postgres, Google Cloud project + API keys, domain).
```

---

## 11. Phase 8 — Production readiness review (final gate)

```
PHASE 8: FINAL PRODUCTION READINESS REVIEW.

Act as an external senior engineer doing a pre-launch review of this codebase
cold, using GAP_REPORT.md as your baseline "before" state. Produce
PRODUCTION_READINESS_CHECKLIST.md covering:

- [ ] All PRD "Must" features fully functional against real DB
- [ ] No hardcoded secrets/fallbacks anywhere in the codebase
- [ ] Auth: refresh tokens, rate limiting, password hashing verified
- [ ] All endpoints have input validation and consistent error responses
- [ ] Test coverage meets the agreed threshold, CI passes green
- [ ] Structured logging + health check + error boundaries in place
- [ ] CORS locked to explicit origins in production config
- [ ] .env.example complete and accurate; SECRETS_CHECKLIST.md accurate
- [ ] Google Business Profile + Maps Grounding Lite integrations
      feature-flagged, default OFF, documented
- [ ] Attribution requirement for Maps Grounding Lite content documented
      and implemented wherever grounded data is shown
- [ ] Dockerfile builds and runs the production bundle successfully
- [ ] DEPLOYMENT_RUNBOOK.md accurate and dry-run-able
- [ ] README fully accurate against actual repo state (this was wrong at
      the start — re-verify, don't just trust it now)

For each unchecked item, state exactly what's missing and the smallest next
prompt I'd need to give you to close it. Do not mark anything done that you
haven't personally verified by reading the relevant code in this session.
```

---

## 12. How to run this in practice

- **Tool:** Claude Code (terminal, VS Code, or desktop) is the best fit here since it can read/write the actual files, run `npm test`/`npm run build`, and iterate against real command output — rather than you copy-pasting code blocks manually.
- **Cadence:** one phase per session/turn. Review the diff and the phase's markdown report before saying "proceed to Phase N+1."
- **If a phase reveals the previous phase's decision was wrong** (e.g. Phase 2 finds Phase 1's ORM choice doesn't fit), stop and re-run that earlier phase's prompt with the correction rather than patching around it in the current phase — this is exactly the kind of compounding drift that turns "production ready" into "looks done, isn't."
- **Don't skip Phase 0.** It's tempting to jump straight to "fix it," but you now have proof the docs don't match the code — the agent needs to independently arrive at that same conclusion before it starts writing fixes, or it will build on the wrong foundation.

---

## 13. Quick reference: Google integration decision

| Need | API | Auth | Notes |
|---|---|---|---|
| Real GBP location/review/post data | Google Business Profile API | OAuth2, manual Google approval | Not instant — apply early, keep mocked fallback |
| Place search / enrichment / AI grounding | Maps Grounding Lite | API key or OAuth | Instant to enable; attribution required on any surfaced content |
| Geocoding an address to lat/lng only | Geocoding API | API key | Simpler/cheaper if you only need coordinates, not AI summaries |

Link for your reference: https://developers.google.com/maps/ai/grounding-lite
