# Achidemy Coming Soon

Static landing page + Cloudflare Pages Function that saves early-access emails to Neon Postgres.

## Database (Neon Postgres)

Create the table:

```sql
create table if not exists early_access_emails (
  id bigserial primary key,
  email text not null unique,
  created_at timestamptz not null default now()
);
```

## Cloudflare Pages Setup

### 1) Environment variable

Set this in Cloudflare Pages:

- `DATABASE_URL`: your Neon connection string

### 2) Deploy

- Keep `index.html` at the project root.
- The API endpoint will be available at `POST /api/subscribe`.
- Deploy from CLI:

```bash
npm run deploy
```

## Local dev (optional)

Install dependencies:

```bash
npm install
```

For local development, use Wrangler Pages dev (required for `/api/subscribe`):

```bash
npm run dev
```

Wrangler reads environment variables from `.dev.vars` automatically. Keep secrets out of git.

