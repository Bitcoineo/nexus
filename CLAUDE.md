# Nexus -- API Platform

## Overview
A REST API platform where developers get API keys, make authenticated requests, track usage, and receive webhook notifications. Includes interactive API documentation, rate limiting, versioning, and a developer dashboard.

## What This Teaches
API keys (generation, hashing, scoping), production rate limiting (sliding window, tiered plans), API versioning (v1/v2), OpenAPI/Swagger docs, webhook delivery with retries, usage tracking and analytics.

## Tech Stack
- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript (strict mode)
- **Database:** Drizzle ORM + Turso (LibSQL)
- **Auth:** Auth.js v5 (Google OAuth + credentials)
- **Styling:** Tailwind CSS
- **Package Manager:** pnpm
- **Accent Color:** #8B5CF6 (violet-500)

## Project Structure
```
src/
  app/                    # Next.js App Router
    (auth)/               # Auth pages group
      signin/
      signup/
    (dashboard)/          # Dashboard pages group
      dashboard/
        keys/
        docs/
        webhooks/
        logs/
    api/
      v1/notes/           # V1 API routes
      v2/notes/           # V2 API routes
      auth/               # Auth.js route handler
      webhooks/           # Webhook management API
  components/             # Shared UI components
  db/
    schema.ts             # Drizzle schema (all tables)
    index.ts              # DB client
    migrate.ts            # Migration runner
    seed.ts               # Seed data
  lib/
    api-key.ts            # Key generation, hashing, validation
    rate-limit.ts         # Sliding window rate limiter
    webhook.ts            # Webhook delivery + retry logic
    usage.ts              # Usage tracking
    utils.ts              # Shared utilities
  middleware.ts           # Route protection
auth.ts                   # Auth.js config
auth.config.ts            # Auth providers
```

## The API -- What It Serves
A simple "Notes" API -- CRUD for notes with tags. The API itself is intentionally simple because the learning is about the infrastructure around it (keys, rate limits, versioning, docs, webhooks), not the data model.

## Database Schema

### Auth Tables
user, account, session, verificationToken (Auth.js standard)

### api_key
- id (nanoid), userId (FK user)
- name (text -- "Production", "Development", etc.)
- keyHash (text -- SHA-256 hash, never store raw)
- keyPrefix (text -- first 8 chars for display: "nx_live_a1b2...")
- scopes (text -- JSON array: ["notes:read", "notes:write", "webhooks:manage"])
- plan (text: free/pro -- determines rate limits)
- lastUsedAt (text, nullable)
- createdAt, revokedAt (nullable -- soft revoke)
- Index on keyHash for fast lookups

### rate_limit_log
- id (nanoid), apiKeyId (FK), endpoint (text), timestamp (text)
- Index on (apiKeyId, timestamp) for sliding window queries

### note
- id (nanoid), userId (FK), apiKeyId (FK -- which key created it)
- title (text), content (text), tags (text -- JSON array)
- version (integer, default 1 -- for v2 API)
- createdAt, updatedAt

### webhook_endpoint
- id (nanoid), userId (FK)
- url (text -- the URL to POST to)
- secret (text -- HMAC signing secret)
- events (text -- JSON array: ["note.created", "note.updated", "note.deleted"])
- active (integer, 0/1)
- createdAt

### webhook_delivery
- id (nanoid), webhookEndpointId (FK)
- event (text -- "note.created", etc.)
- payload (text -- JSON)
- status (text: pending/success/failed)
- statusCode (integer, nullable)
- attempts (integer, default 0)
- lastAttemptAt (text, nullable)
- nextRetryAt (text, nullable)
- createdAt

### api_usage
- id (nanoid), apiKeyId (FK)
- endpoint (text), method (text)
- statusCode (integer)
- responseTimeMs (integer)
- timestamp (text)
- Index on (apiKeyId, timestamp) for usage analytics

## Rate Limits
- **Free plan:** 100 requests/day, 10 requests/minute
- **Pro plan:** 10,000 requests/day, 100 requests/minute
- Sliding window on rate_limit_log table
- Response headers: X-RateLimit-Limit, X-RateLimit-Remaining, X-RateLimit-Reset

## API Versioning
- `/api/v1/notes` -- original schema (title, content, tags as comma string)
- `/api/v2/notes` -- enhanced schema (title, content, tags as array, version field, metadata)
- Both versions work simultaneously
- Version in URL path, not headers

## API Authentication
- Bearer token: `Authorization: Bearer nx_live_xxxxx`
- Query param: `?api_key=nx_live_xxxxx`
- Keys hashed with SHA-256 before DB lookup
- Validates: key exists, not revoked, has required scope

## Webhook Events
- note.created, note.updated, note.deleted
- Payload signed with HMAC-SHA256 using endpoint's secret
- Retry: up to 3 attempts with exponential backoff (1min, 5min, 15min)

## Pages
- `/auth/signin`, `/auth/signup` -- authentication
- `/` -- landing page
- `/dashboard` -- overview with usage charts
- `/dashboard/keys` -- API key management
- `/dashboard/docs` -- interactive API documentation
- `/dashboard/webhooks` -- webhook endpoint management
- `/dashboard/logs` -- request logs

## Commands
```bash
pnpm dev              # Start dev server
pnpm build            # Production build
pnpm db:generate      # Generate Drizzle migrations
pnpm db:migrate       # Run migrations
pnpm db:seed          # Seed database
pnpm db:studio        # Open Drizzle Studio
```
