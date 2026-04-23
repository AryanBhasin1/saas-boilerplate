# SaasKit — Multi-Tenant SaaS Boilerplate

Production-grade multi-tenant SaaS with AI chat, RAG over uploaded documents, usage-based billing, and complete org-scoped data isolation.

## Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 15 (App Router) |
| Auth + Orgs | Clerk |
| Database | Postgres + pgvector (Railway) |
| Cache / Queue | Redis (Railway) |
| AI | Groq — Llama 3.3 70B |
| Embeddings | `@xenova/transformers` (free, local) |
| Billing | Stripe subscriptions |
| Deployment | Vercel |

## Local Setup

```bash
# 1. Install
npm install

# 2. Copy env and fill in values
cp .env.example .env

# 3. Enable pgvector in Railway Postgres shell
# CREATE EXTENSION IF NOT EXISTS vector;

# 4. Run migrations
npx prisma migrate dev --name init

# 5. Start dev server
npm run dev

# 6. In a second terminal — Stripe webhooks
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

## Key Design Decisions

**`orgId` on every row** — explicit, auditable tenant isolation. No hidden RLS policies that can silently misconfigure.

**Groq for AI** — free tier, fastest inference available. One-line swap to any other provider via Vercel AI SDK.

**Local embeddings** — `@xenova/transformers` with `all-MiniLM-L6-v2`. Zero cost, downloads once, caches in `/tmp`.

**Token writes are sync** — recorded after each response. For high scale, move to BullMQ + Redis queue.

## Plans

| Plan | Tokens/month | Price |
|---|---|---|
| Free | 50,000 | $0 |
| Pro | 500,000 | $49/mo |
| Enterprise | 5,000,000 | $299/mo |

## Super Admin

Set `SUPER_ADMIN_USER_IDS=user_xxxxx` (your Clerk user ID). That user sees an Admin link in the sidebar with system-wide MRR, token usage, and org table.
 
