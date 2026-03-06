# Nexus — Project Setup

## Phase 1: Foundation (COMPLETE)
- [x] Create CLAUDE.md with full project spec
- [x] Init Next.js 14 (TypeScript strict, App Router, Tailwind, pnpm)
- [x] Install all dependencies
- [x] Create src/db/schema.ts with all 10 tables
- [x] Create src/db/index.ts (DB client)
- [x] Create src/db/migrate.ts (migration runner)
- [x] Create drizzle.config.ts
- [x] Auth setup: auth.ts + auth.config.ts (Google OAuth + credentials)
- [x] Create .env.local template
- [x] Create src/db/seed.ts (user, API key, 20 notes, 594 usage logs, webhook + deliveries)
- [x] Create middleware.ts (protect /dashboard/* routes)
- [x] Run drizzle-kit generate (migration generated successfully)
- [x] Run migrate + seed (verified working)
- [x] Verify .gitignore includes .env and .db files

## Phase 2: API Routes (TODO)
- [ ] API key validation lib (src/lib/api-key.ts)
- [ ] Rate limiting lib (src/lib/rate-limit.ts)
- [ ] Usage tracking lib (src/lib/usage.ts)
- [ ] Webhook delivery lib (src/lib/webhook.ts)
- [ ] /api/v1/notes CRUD routes
- [ ] /api/v2/notes CRUD routes
- [ ] /api/auth/[...nextauth] route handler
- [ ] Webhook management API routes

## Phase 3: Dashboard Pages (TODO)
- [ ] Landing page (/)
- [ ] Auth pages (signin, signup)
- [ ] Dashboard overview with usage charts
- [ ] API key management page
- [ ] Interactive API docs page
- [ ] Webhook management page
- [ ] Request logs page

## Accent Color
#8B5CF6 (violet-500) — developer/API energy
