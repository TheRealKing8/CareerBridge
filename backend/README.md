# `backend/`

A reserved folder for a future CareerBridge backend service. The
actual application is currently fully implemented inside the Next.js
app under `frontend/` — API routes live under
`frontend/src/app/api/...`.

This folder is a **stub**, not a separate running service. The
scaffolding exists so that, when you start pulling functionality out
of the Next.js app (long-running jobs, scheduled tasks, integrations
that can't live inside Vercel's request lifecycle), the home for that
code already exists.

## Layout

```
backend/
├── package.json
├── tsconfig.json
├── .env.example
└── src/
    ├── index.ts          # entry point
    ├── config/env.ts     # typed env loader
    ├── db/client.ts      # Prisma client singleton
    ├── middleware/auth.ts
    ├── routes/           # HTTP route handlers (empty for now)
    └── utils/logger.ts
```

## Setup

```bash
cd backend
npm install
npm run typecheck
```

Nothing else to do — there's no service to start yet. When the first
route lands, `npm run dev` will typecheck in watch mode and
`npm run start` will run the compiled service.

## Sharing the database

`backend/` and `frontend/` share the same Prisma schema at
`../prisma/schema.prisma` and the same `DATABASE_URL`. The client
under `backend/src/db/client.ts` points at the same DB so both
processes can read/write the same data.
