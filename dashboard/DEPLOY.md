# NAGUAL CONTROL TERMINAL -- Deployment

## Quick Start

1. Install dependencies:
   ```
   npm install
   # or: bun install
   ```

2. Set backend URL in .env:
   ```
   NAGUAL_BACKEND_URL=http://your-backend-server:8000
   ```

3. Run in production:
   ```
   npm run build
   npm run start
   ```
   Dashboard will be available at http://localhost:3000

## Development

```
npm run dev
```

## Architecture

- `/api/nagual/[...path]` -- Proxy route that forwards all requests to the Python backend
- `/lib/api.ts` -- API client with mock data fallback
- `/lib/mock-data.ts` -- Demo data shown when backend is unreachable
- `/hooks/useNagualAPI.ts` -- React Query hooks (auto-refresh every 10s)

## Backend API Endpoints Expected

The dashboard calls these endpoints on the backend:
- GET /status, /mind, /memory, /llm, /evolution, /toltec
- GET /safety, /heartbeat, /research, /goals, /thoughts
- GET /tools, /swarm, /logs, /meta, /settings
- POST /chat

## Without Backend

If no backend is available, the dashboard shows realistic mock data
so you can preview the UI.
