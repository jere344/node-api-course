# Deploy On Render

## 1. Service setup

- Create a **Web Service** on Render from this repository.
- Root directory: `evaluations/day3`
- Build command: `npm ci`
- Start command: `npm run start:render`

You can also use the included `render.yaml` blueprint.

## 2. Environment variables

Set these variables in Render:

- `NODE_ENV=production`
- `DATABASE_URL=file:/var/data/dev.db`
- `JWT_SECRET=<strong_random_secret>`
- `JWT_REFRESH_SECRET=<another_strong_random_secret>`
- `ALLOWED_ORIGINS=https://your-frontend-domain.com`

Notes:

- `PORT` is injected by Render automatically.
- With SQLite, use a persistent disk mounted at `/var/data` so data survives restarts.

## 3. Prisma in production

The start script runs:

```bash
prisma migrate deploy && node src/index.js
```

This applies committed migrations before starting the API.

## 4. Health checks

After deploy, verify:

- `GET /api/livres` returns `200`
- `GET /api-docs` is reachable
- `POST /api/auth/login` works and sets the refresh cookie

## 5. Security reminders

- Keep `.env` out of git.
- Never expose real JWT secrets in code or logs.
- In production, refresh cookie is `HttpOnly` + `Secure` + `SameSite=Strict`.
