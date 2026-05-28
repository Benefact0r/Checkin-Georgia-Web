# Checkin Georgia — Web

Next.js 15 (App Router, TypeScript, Tailwind) for the [Checkin Georgia](https://github.com/Benefact0r/Checkin-Georgia-API) platform. This repo hosts:

- the marketing landing page,
- the business dashboard (later),
- and a public venue browse UI.

The mobile app lives at [`Checkin-Georgia-App`](https://github.com/Benefact0r/Checkin-Georgia-App).

## Develop

```bash
npm install
npm run dev
# → http://localhost:3000
```

It will hit the live dev API at `https://checkin-georgia-api-171625154738.europe-west1.run.app` by default. Override with:

```bash
NEXT_PUBLIC_API_URL=http://localhost:8080 npm run dev
```

## Routes today

- `/` — landing + venues list (server-rendered from API)
- `/venues/[slug]` — venue detail with services + placeholder payment buttons

## Deployment

Vercel preferred (Next.js native). GHA workflow to be added once `vercel.com` project is linked. Alternative: Cloud Run with `output: standalone` build mode.
