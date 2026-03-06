# Nexus

Developer platform for managing API keys, webhooks, and request logs. Generate scoped API keys, register webhook endpoints, and monitor delivery status with automatic retries.

**Stack:** `Next.js 14 · TypeScript · Auth.js v5 · Drizzle ORM · Turso (SQLite) · Tailwind CSS`

**Live:** https://nexus-bitcoineo.vercel.app

---

## Why I built this

I wanted to understand how developer platforms like Stripe and GitHub actually work under the hood: hashed API keys that are only shown once, HMAC-signed webhook payloads, automatic retry logic with exponential backoff, per-plan rate limiting enforced at the database level, and versioned API routes. Nexus is a working implementation of all of it.

## Features

- **API key management** Generate scoped keys with nx_live_ prefix, stored as SHA-256 hashes, shown in plaintext only once
- **Webhook endpoints** Register URLs, select events, auto-generated signing secret
- **HMAC signatures** Every delivery signed with X-Nexus-Signature header for verification
- **Automatic retries** Failed deliveries retried at 1min, 5min, and 15min intervals, max 3 attempts
- **Delivery logs** Full history of webhook delivery attempts with status codes
- **Rate limiting** Free plan: 10 req/min, 100 req/day — Pro plan: 100 req/min, 10k req/day
- **Versioned API** v1 and v2 routes with independent schemas
- **Request logs** Dashboard showing usage over time per API key
- **Interactive docs** Built-in API documentation with request/response examples

## Setup

    pnpm install
    cp .env.example .env.local

Fill in your .env.local:

    DATABASE_URL=           # Turso database URL
    DATABASE_AUTH_TOKEN=    # Turso auth token
    AUTH_SECRET=            # openssl rand -base64 32
    NEXT_PUBLIC_BASE_URL=   # http://localhost:3000 for dev

Run migrations and start:

    pnpm db:migrate
    pnpm dev

Open http://localhost:3000

## API Routes

    GET    /api/v1/notes         List notes
    POST   /api/v1/notes         Create note
    GET    /api/v1/notes/[id]    Get note
    PUT    /api/v1/notes/[id]    Update note
    DELETE /api/v1/notes/[id]    Delete note
    GET    /api/v2/notes         List notes (v2 schema)
    POST   /api/v2/notes         Create note (v2 schema)

All routes require a valid API key in the Authorization header.

## GitHub Topics

`nextjs` `typescript` `api` `webhooks` `api-keys` `rate-limiting` `drizzle-orm` `turso` `sqlite` `authjs` `tailwind` `developer-tools` `hmac`
