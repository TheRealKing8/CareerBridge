# CareerBridge

**Tagline:** Connecting students, graduates, and employers through opportunities.

CareerBridge is a platform that connects students, graduates, and employers through opportunities — internships, attachments, graduate trainee programs, and full-time jobs.

## Features

- **Four roles**: `STUDENT`, `EMPLOYEE`, `EMPLOYER`, `ADMIN` (role-gated dashboards). `STUDENT` and `EMPLOYEE` share the job-seeker dashboard; `EMPLOYEE` is for experienced candidates (work history instead of university).
- **Authentication**: email + password (NextAuth, JWT sessions, bcryptjs hashed credentials).
- **Email verification** on signup; **password reset** via emailed one-time link.
- **Job listings** with public browse + employer create/manage.
- **Applications** — students apply, employers review.
- **Admin moderation** — verify employers, approve/remove jobs, bulk actions.
- **AI career chat** — `/api/chat` (authenticated, per-user rate-limited).
- **Uniform site chrome** — header + footer on every public route.
- **Sample data** — `npm run db:seed` populates 6 demo users (2 employers, 3 students, 1 experienced employee), 4 jobs across all status types, applications (incl. one from an EMPLOYEE), saved jobs, and notifications so dashboards are immediately useful. Every demo user shares the password `DemoPass1234!`.

## Tech Stack

- **Next.js 16** (App Router) + **TypeScript** + **React 19**
- **Tailwind CSS 4**
- **Prisma 5** with **MariaDB / MySQL** (XAMPP for local dev)
- **NextAuth v4** — Prisma adapter, JWT sessions
- **Zod** for request validation
- **nodemailer** for SMTP email (dev: links logged to console)
- **vitest** for unit tests
- **tsx** for running TS scripts (Prisma seed)

## Project layout

```
CareerBridge/
├── frontend/                 # Next.js app (App Router)
│   └── src/
│       ├── app/              # Routes (public, (auth), dashboards, /api)
│       ├── components/       # UI components (auth/, site/, dashboard/, …)
│       └── lib/              # Validators, services, guards, helpers
├── prisma/                   # Prisma schema, migrations, seed.ts
├── backend/                  # Reserved for a future standalone API
└── package.json              # Monorepo root — scripts run the frontend
```

All scripts run from the **repo root** (e.g. `npm run dev`, `npm run build`).

## Getting Started

### 1. Install

```bash
npm install
```

`postinstall` automatically runs `prisma generate`.

### 2. Configure environment

```bash
cp .env.example .env
```

Edit `.env`. The minimum required values:

| Var                | Required | Notes                                                                          |
| ------------------ | -------- | ------------------------------------------------------------------------------ |
| `DATABASE_URL`     | yes      | `mysql://root:@localhost:3306/careerbridge` (XAMPP default).                    |
| `NEXTAUTH_SECRET`  | yes      | Generate with `openssl rand -base64 32`. App refuses to boot if missing/short. |
| `NEXTAUTH_URL`     | yes      | `http://localhost:3000` in dev.                                                |
| `ANTHROPIC_API_KEY`| optional | Enables the AI chat. Without it, `/api/chat` returns 503.                      |
| `SMTP_*`           | optional | When unset, password-reset / verification links are logged to the server console (and surfaced in non-prod API responses). |
| `SEED_ADMIN_*`     | optional | Required only when running `npm run db:seed`.                                  |

> **Mismatched secrets cause silent 401s at login.** Keep `NEXTAUTH_SECRET` identical in `frontend/.env` if you mirror the var there.

### 3. Migrate + seed

**Create the XAMPP database first** (one-time):

```bash
# Either via phpMyAdmin (http://localhost/phpmyadmin → New database:
# name = careerbridge, collation = utf8mb4_unicode_ci),
# or from the command line:
"C:\xampp\mysql\bin\mysql.exe" -u root -e "CREATE DATABASE IF NOT EXISTS careerbridge CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
```

Then run the migrations and (optionally) seed:

```bash
npm run db:migrate        # apply migrations to careerbridge
npm run db:seed           # creates one ADMIN user + sample data
```

`SEED_ADMIN_EMAIL` and `SEED_ADMIN_PASSWORD` must both be set; password must be at least 12 characters.

### 4. Run

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Scripts

| Command              | What it does                                              |
| -------------------- | --------------------------------------------------------- |
| `npm run dev`        | Next.js dev server (with HMR).                            |
| `npm run build`      | Production build.                                         |
| `npm run start`      | Run the production build.                                 |
| `npm run lint`       | ESLint over `frontend/`.                                  |
| `npm test`           | vitest suite (`validators`, `rate-limit`, `csrf`).        |
| `npm run db:migrate` | `prisma migrate dev` — apply + create migrations.         |
| `npm run db:reset`   | Drop + recreate the dev DB. **Destroys data.**            |
| `npm run db:studio`  | Open Prisma Studio against `DATABASE_URL`.                |
| `npm run db:seed`    | Run `prisma/seed.ts` to create the seeded admin.          |

## Roles

- **STUDENT** — find opportunities, build a university/graduation profile, upload CV, track applications, AI career guidance.
- **EMPLOYEE** — same job-seeker dashboard as STUDENT, but with a work-history profile (current title, years of experience, skills). Can apply to any job.
- **EMPLOYER** — post jobs, review applicants (including EMPLOYEE applicants), manage recruitment. Requires admin verification before posting.
- **ADMIN** — moderate users (role, status, delete), verify employers, manage jobs, view analytics. Single seeded account. All dashboards default to **dark mode** with a moon-icon toggle to light.

## Security notes

- **CSRF** — all custom `POST/PATCH/DELETE` routes validate the `Origin` header against `NEXTAUTH_URL`.
- **Rate limiting** — auth endpoints (`/api/register`, `/api/forgot`, `/api/reset`) are throttled per-IP; `/api/chat` is throttled per-user.
- **Password rules** — 8+ characters, must include a letter and a digit, not on the top-100 common-passwords blocklist.
- **JWT invalidation on reset** — changing your password invalidates other active sessions (`passwordChangedAt` column).
- **Email verification** — unverified users see a banner and can resend the link.

## Deploy

CareerBridge is a single Next.js 16 app (App Router) backed by a SQLite database. Any platform that runs Node 20+ will work — the notes below cover the two most common choices.

### Vercel (recommended for the frontend)

1. Push the repo to GitHub and import the project on Vercel.
2. Set the **Root Directory** to the repo root (the `package.json` lives there). The `dev`/`build` scripts already target `frontend/`.
3. **Environment variables** — add all of the required vars from `.env.example` to the Vercel project settings:
   - `DATABASE_URL`, `NEXTAUTH_SECRET`, `NEXTAUTH_URL` (use your Vercel URL, e.g. `https://careerbridge.vercel.app`).
   - `SMTP_*` + `EMAIL_FROM` so users actually receive emails.
   - `ANTHROPIC_API_KEY` if you want the chat endpoint.
4. **Database** — SQLite on a serverless platform is fragile (writes don't persist across deploys in most setups). For production, switch `DATABASE_URL` to a managed Postgres (Neon, Supabase, Railway) and update `prisma/schema.prisma`'s `provider` to `postgresql` before running `prisma migrate deploy`.
5. **Build command** is the default `npm run build`. Add a `postinstall` step if you don't have one (it's already in `package.json`).

### Self-hosted (VPS / Docker)

1. Provision a Node 20+ host. Persist `./prisma/dev.db` (or use Postgres as above).
2. `git clone … && cd CareerBridge && cp .env.example .env && nano .env`
3. `npm install --omit=dev=false` (devDeps are required for `prisma generate` + build).
4. `npm run db:migrate -- --name init` to apply migrations on first deploy.
5. `npm run build && npm start` behind a reverse proxy (Caddy / nginx) that terminates TLS and forwards `X-Forwarded-For` so rate limiting works correctly.
6. Run under a process manager (systemd / pm2) so the server restarts on crash.

### Deploy checklist

- [ ] `NEXTAUTH_SECRET` is a fresh 32+ char random value — **never reuse a dev secret**.
- [ ] `NEXTAUTH_URL` matches the public URL exactly (including scheme — `https://`).
- [ ] `DATABASE_URL` points to a persistent database; if you switch to Postgres, run `prisma migrate deploy` (not `dev`) so it doesn't try to create migrations.
- [ ] SMTP is configured — without it, password reset and email verification silently no-op.
- [ ] `npm test` and `npm run build` pass locally before pushing.

## License

MIT — see `LICENSE`.
