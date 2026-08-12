# Lumina Finance

A premium glassmorphic AI personal-finance planning app inspired by the supplied Stitch screens.

## Run locally

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open http://localhost:3000.

### Local mode

If Supabase variables are empty, Lumina runs in browser-local demo mode. You can create a local identity and use the dashboard, transactions, goals, and advisor without an account server. This mode is for prototyping only.

### Real authentication + cloud data

1. Create a Supabase project.
2. Run `supabase/schema.sql` in the Supabase SQL editor.
3. Add your Supabase URL and anon key to `.env.local`.
4. In Supabase Auth, enable Email and Google providers.
5. Add your app URL and `/auth/callback` to the allowed redirect URLs.
6. Restart the dev server.

### AI advisor

Set `OPENAI_API_KEY` and optionally `OPENAI_MODEL`. Without a key, the advisor uses a deterministic local fallback so the UI remains usable.

## Production notes

- Supabase RLS policies scope transactions/goals to the authenticated user.
- Never expose a service-role key to the browser.
- The AI endpoint only receives the current user's computed snapshot and goals from the client; for a hardened deployment, compute/read these server-side from Supabase using the authenticated session.
- Investment, tax, and legal outputs are intentionally framed as general planning/education rather than regulated advice.
