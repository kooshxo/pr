# ProxiBrowse - Advanced Web Proxy Browser

A feature-rich, modern web proxy browser built with React, TypeScript, and Express. Browse securely with tabs, bookmarks, history, and multiple themes.

## Features

- Multi-Tab Browsing with keyboard shortcuts
- Bookmarks System with folders
- History Tracking with search
- 4 Beautiful Themes (Dark, Light, Ocean, Forest)
- PWA Support
- Secure Proxy with rate limiting and caching
- Full keyboard navigation

## Deployment

### Frontend to Vercel (Free)
1. Push code to GitHub
2. Import project in Vercel
3. Set framework: Vite
4. Build command: npm run build
5. Output: dist
6. Set VITE_BACKEND_URL env var

### Backend - FREE Options (No Payment Required)

#### Option 1: Railway (Free Tier)
1. Go to https://railway.app
2. "New Project" → "Deploy from GitHub repo"
3. Select your repo
4. Railway auto-detects Node.js
5. Add environment variable: `ALLOWED_ORIGINS`
6. Deploy - free tier includes $5 credit monthly

#### Option 2: Cyclic (Free Forever)
1. Go to https://cyclic.sh
2. Connect GitHub repo
3. Cyclic auto-deploys from `backend/` folder
4. Add env var: `ALLOWED_ORIGINS`
5. No credit card required

#### Option 3: Fly.io (Free Allowance)
1. Install flyctl: `powershell -Command "iwr https://fly.io/install.ps1 -useb | iex"`
2. `cd backend`
3. `fly launch` (creates fly.toml)
4. `fly deploy`
5. Free tier: 3 shared-cpu-1x VMs, 3GB persistent storage

#### Option 4: Replit (Always Free)
1. Import GitHub repo to Replit
2. Set run command: `cd backend && npm start`
3. Get public URL from "Share" button
4. Limited but works for testing

## Quick Start

Install dependencies:
```bash
cd backend && npm install
cd ../frontend && npm install
```

Start dev servers:
```bash
cd backend && npm run dev    # Terminal 1
cd frontend && npm run dev   # Terminal 2
```

Open http://localhost:5173

## Tech Stack

**Frontend:** React 18, TypeScript, Vite, Tailwind CSS, Zustand
**Backend:** Express, Helmet, Rate Limiting, Caching

## License

MIT
