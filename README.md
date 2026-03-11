
  # Thực hiện yêu cầu

  This is a code bundle for Thực hiện yêu cầu. The original project is available at https://www.figma.com/design/P8EExj5TRvas04031ZDb3U/Th%E1%BB%B1c-hi%E1%BB%87n-y%C3%AAu-c%E1%BA%A7u.

  ## Running the code

  Run `npm i` to install the dependencies.

  Run `npm run dev` to start the development server.

  ## AI chat (Gemini)

  Set server env var `GEMINI_API_KEY` (and optional `GEMINI_MODEL`) on Vercel.
  The frontend will call `/api/ai/chat` on the same deployment, so the key is not exposed to the browser.

  ## Admin account

  - Default admin (seeded automatically on first login/register):
    - Email: `admin@mln131.local`
    - Password: `Admin@123456`
  - You can override the seeded admin via server env vars:
    - `ADMIN_EMAIL`
    - `ADMIN_PASSWORD`
  - All newly registered accounts are normal `user`.
  - Admin page: `/admin`
  - To reset local users on the same browser, clear LocalStorage key `mln131.users.v1` (and `mln131.auth` to logout).

  ## Multi-browser realtime (admin stats + shared users)

  By default (no KV configured), data is stored in LocalStorage so it is per-browser.
  To link multiple browsers/devices together, configure Vercel KV (Upstash Redis REST) so `/api/*` can persist shared state.

  - Required server env vars (choose one pair):
    - `KV_REST_API_URL` + `KV_REST_API_TOKEN`
    - or `UPSTASH_REDIS_REST_URL` + `UPSTASH_REDIS_REST_TOKEN`

  Local dev with shared data:
  - Put the KV env vars above into `MLN131_FE/.env.local` (do not commit).
  - Run `npm run dev` and open `http://localhost:5173` in multiple browsers.
  - Quick check: open `/api/health` and ensure `kvConfigured: true`.
  
