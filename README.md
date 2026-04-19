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

#### Option 1: Cyclic.sh (Free Forever) ← BEST OPTION
1. Go to https://cyclic.sh
2. Sign in with GitHub
3. "Deploy" → Select your repo
4. Set root: `/backend`
5. Add env var: `ALLOWED_ORIGINS` (your Vercel frontend URL)
6. Deploy - **no payment info needed, stays awake**

#### Option 2: Glitch (Free Forever)
1. Go to https://glitch.com
2. "New Project" → "Import from GitHub"
3. Paste your repo URL: `https://github.com/kooshxo/pr`
4. In terminal: `cd backend && npm install`
5. Set `.env` file: `ALLOWED_ORIGINS=your-vercel-url`
6. **Free but sleeps after 5 min (wakes on request)**

#### Option 3: Adaptable.io (Free Tier)
1. Go to https://adaptable.io
2. "Deploy Now" → GitHub
3. Select repo, choose `backend` folder
4. Set Node.js start command: `npm start`
5. Add env vars, deploy
6. **Free, no credit card**

#### Option 4: Replit (Always Free)
1. https://replit.com → Import from GitHub
2. Your URL: `https://pr--duanesalt9.replit.app`
3. Sleeps after 30 min inactivity
4. **Actually free but annoying sleep timeout**

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
