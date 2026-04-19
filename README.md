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
2. Import project in Vercel (vercel.com)
3. Select "Vite" as framework
4. Build command: `npm run build`
5. Output directory: `dist`
6. Add env var: `VITE_BACKEND_URL` (your backend URL)

### Backend - Actually Free Options (No Credit Card)

#### Option 1: Replit (Always Free) ← RECOMMENDED
1. Go to https://replit.com
2. Click "Create" → "Import from GitHub"
3. Select your `kooshxo/pr` repo
4. Replit auto-detects the `.replit` file
5. Click "Run" (runs `cd backend && npm start`)
6. Once running, click "Share" for public URL
7. Set `ALLOWED_ORIGINS` secret in Replit (your Vercel URL)
8. **Actually free, no payment required**

#### Option 2: Cyclic.sh (Free Forever)
1. Go to https://cyclic.sh
2. Sign in with GitHub
3. "Deploy" → Select your repo
4. Set root: `/backend`
5. Add env var: `ALLOWED_ORIGINS` (your Vercel frontend URL)
6. Deploy - no payment info needed

#### Option 3: Fly.io (Free Allowance - requires CC)
```bash
cd backend
fly launch --name proxibrowse-backend
fly deploy
```
Free tier: 3 shared-cpu-1x VMs, stays running

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
