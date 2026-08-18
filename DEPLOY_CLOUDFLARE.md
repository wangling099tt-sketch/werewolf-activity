# 🐺 Wolvesville - Cloudflare Deployment Guide

## Quick Deploy (Cloudflare Pages + Workers)

### Prerequisites
- `npm install -g wrangler`
- Wrangler logged in: `wrangler login`

### Deploy Frontend (Cloudflare Pages)
```bash
cd client
npm install
npm run build
wrangler pages deploy ./dist --project-name werewolvesville
```

### Deploy Backend (Cloudflare Workers)
```bash
cd worker
npm install
wrangler deploy
```

### Cloudflare Dashboard
- **Pages**: https://dash.cloudflare.com/?to=/:account/pages
- **Workers**: https://dash.cloudflare.com/?to=/:account/workers

## Fallback Server
- Cloudflare Pages: `https://werewolvesville.pages.dev`
- Railway (current): `https://werewolf-activity-production.up.railway.app`

Client tự động detect và fallback giữa 2 servers.

## Project Structure
```
werewolf-activity/
├── client/              # Vite + React frontend (deploy to Cloudflare Pages)
│   ├── src/
│   ├── public/
│   ├── wrangler.toml    # Cloudflare Pages config
│   └── package.json
├── server/              # Node.js + Socket.io (deploy to Railway)
├── worker/              # Cloudflare Workers + Durable Objects (backup)
│   ├── src/
│   └── wrangler.toml
└── Dockerfile
```
