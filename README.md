# ProxiBrowse - Transparent Web Proxy Browser

A full-featured web proxy browser that creates a transparent browsing tunnel through server-side fetching and client-side request interception. Browse the web through a same-origin-bypass proxy system with tabs, bookmarks, history, and session persistence.

---

## Architecture Overview

### Pattern: Reverse Proxy with Client-Side Interception

ProxiBrowse implements a **transparent browsing tunnel** that creates the illusion of direct site access while routing all traffic through a controlled proxy layer. This architecture bypasses CORS restrictions, enables session persistence, and provides sandboxed execution of untrusted web content.

---

## How It Works

### 1. Proxy Layer (Server-Side)

The proxy server acts as a transparent intermediary:

- **Request Forwarding**: Fetches target URLs server-side, bypassing browser CORS policies
- **HTML Rewriting**: Regex-based transformation of all `href`, `src`, and `action` attributes to route back through the proxy
- **Response Streaming**: Forwards relevant headers (content-type, cookies, cache-control) while stripping security headers that block embedding (`X-Frame-Options`, `Content-Security-Policy`)
- **Session Handling**: Forwards `Set-Cookie` headers to maintain authentication state with target sites

### 2. Sandboxed Container (Client-Side)

The frontend creates an isolated browsing environment:

- **Isolated iframe**: Uses `sandbox="allow-scripts allow-forms allow-same-origin allow-popups"` to isolate proxied content from the parent application
- **Same-Origin Illusion**: iframe loads content from the same domain (via proxy), bypassing Same-Origin Policy restrictions
- **Transparent Interface**: User interacts with a rewritten "mirror" of the target site where all navigation stays within the proxy

### 3. Request Interception (Client-Side)

A runtime script injection system ensures all dynamic requests route through the proxy:

- **XHR Interception**: Overrides `XMLHttpRequest.prototype.open` to prefix URLs with the proxy endpoint
- **Fetch Interception**: Wraps `window.fetch` to route requests through `/api/proxy`
- **Navigation Override**: Intercepts `window.open` and `history.pushState` for SPA compatibility
- **Form Handling**: Rewrites form `action` attributes to submit through the proxy

---

## Data Flow

```
User enters URL → Frontend encodes → /api/proxy?url=TARGET
                                              ↓
                                    Server fetches target site
                                              ↓
                                    Rewrites all URLs in HTML
                                    (href/src/action → proxy)
                                              ↓
                                    Injects interception script
                                              ↓
                                    Serves to iframe (same origin)
                                              ↓
                                    User clicks/interacts
                                              ↓
                                    Request intercepted → back to proxy
```

---

## Features

- **Multi-Tab Browsing**: Full browser-like tab management with keyboard shortcuts (Ctrl+T, Ctrl+W, etc.)
- **Bookmark System**: Organize favorites with folders and search functionality
- **History Tracking**: Complete browsing history with date grouping and fuzzy search
- **Session Persistence**: Maintains cookies and login state across sessions (YouTube, etc.)
- **Theming**: 4 built-in themes (Dark, Light, Ocean, Forest) with system preference detection
- **PWA Support**: Installable as a Progressive Web App with offline capabilities
- **Keyboard Navigation**: Full keyboard control (navigation, address bar focus, shortcuts)
- **Security Sandboxing**: Origin-isolated iframe prevents target sites from accessing parent window

---

## Technical Specifications

### Frontend
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS with CSS variables for theming
- **State Management**: Zustand (lightweight, persistent store)
- **Icons**: Lucide React
- **Search**: Fuse.js for fuzzy matching in bookmarks/history
- **Hotkeys**: react-hotkeys-hook for keyboard shortcuts

### Backend/Proxy
- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Security**: Helmet (with iframe embedding exceptions)
- **Rate Limiting**: express-rate-limit (configurable per IP)
- **Compression**: Response compression for bandwidth optimization
- **Caching**: In-memory LRU cache for frequently accessed resources
- **HTTP Client**: node-fetch for proxy requests

### Security Model
- **CORS Strategy**: Server-side origin bypass with URL rewriting
- **Sandboxing**: iframe isolation with controlled capability grants
- **Private Network Blocking**: Prevents access to localhost/internal IPs
- **Credential Handling**: Secure cookie forwarding with path/domain preservation

---

## Project Structure

```
/
├── api/                    # Vercel serverless API routes (optional deployment)
│   ├── proxy.js           # Serverless proxy implementation
│   └── package.json       # API dependencies
├── backend/               # Standalone Express server
│   ├── server.js          # Main proxy server with HTML rewriting
│   └── package.json      
└── frontend/              # React SPA
    ├── src/
    │   ├── components/    # UI components (Browser, Toolbar, WebView, etc.)
    │   ├── stores/        # Zustand state management
    │   └── lib/           # Utilities and types
    └── package.json
```

---

## Local Development

Install dependencies:
```bash
cd backend && npm install
cd ../frontend && npm install
```

Start development servers:
```bash
# Terminal 1 - Backend
cd backend && npm run dev

# Terminal 2 - Frontend
cd frontend && npm run dev
```

Open http://localhost:5173

---

## Architecture Classification

| Aspect | Classification |
|--------|----------------|
| **Type** | Transparent Web Proxy / MITM Browsing Environment |
| **Pattern** | Reverse Proxy with Client-Side Interception |
| **Security Model** | Origin-sandboxed isolation with credential forwarding |
| **CORS Strategy** | Server-side origin bypass with URL rewriting |
| **Session Handling** | Cookie passthrough with client-side persistence |

---

## License

MIT
