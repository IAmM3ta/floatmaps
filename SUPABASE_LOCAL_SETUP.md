# Local Supabase Development Setup

This project uses Docker Compose + Supabase CLI for local development.

## Quick Start

1. Start Docker services:
   ```bash
   docker compose up -d
   ```

2. Install Supabase CLI (if not already installed):
   ```bash
   npm install -g supabase
   ```

3. Initialize Supabase (first time only):
   ```bash
   npx supabase init
   ```

4. Start local Supabase stack:
   ```bash
   npx supabase start
   ```

5. Apply migrations:
   ```bash
   npx supabase db reset
   ```

## Environment Variables

Copy `.env.example` to `.env` and fill in the values from `supabase status` after starting.

## Useful Commands

```bash
# View logs
npx supabase logs

# Reset database
npx supabase db reset

# Deploy Edge Functions locally
npx supabase functions serve

# Stop everything
npx supabase stop
```

## Notes

- The `docker-compose.yml` provides a lightweight Postgres + Studio setup.
- For full local Supabase (Auth, Edge Functions, Realtime, Storage), use the official Supabase CLI (`supabase start`).
- Future: We can add coturn (TURN server) or other services to this compose file.
