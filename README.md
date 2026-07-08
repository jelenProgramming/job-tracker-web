# Tracklr - Web

React + Vite front end for the Tracklr API. A funnel of your pipeline at the
top, filter by status / company / search, and a detail panel for each
application with an activity timeline, inline status changes, and notes.

## Run locally

```bash
npm install
cp .env.example .env       # point VITE_API_URL at your API
npm run dev
```

Make sure the Laravel API (the `jobtracker` repo) is running.

## Deploy to Vercel

Push to GitHub, import on Vercel, framework preset **Vite**. Set `VITE_API_URL`
to your deployed Railway API URL (no trailing slash).

## Notes

Auth token is stored in `localStorage`. Status colors are shared between the
funnel, the application cards, and the status badges.
