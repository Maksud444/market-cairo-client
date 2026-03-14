# Coolify Deployment Guide - Market Cairo

## Architecture
```
yourdomain.com        → Frontend (Next.js, port 3000)
api.yourdomain.com    → Backend  (Express, port 5000)
```

---

## Step 1: Code Repository
GitHub/GitLab এ push করুন। Coolify GitHub থেকে deploy করে।

---

## Step 2: Coolify তে Project তৈরি

### Backend Service তৈরি:
1. Coolify Dashboard → **New Resource** → **Docker Compose**
2. Repository URL দিন
3. Branch: `main`
4. **Docker Compose file**: `docker-compose.yml` (root এ আছে)

---

## Step 3: Environment Variables (Coolify UI তে)

Coolify → আপনার Project → **Environment Variables** এ নিচের সব দিন:

```
MONGODB_URI=mongodb+srv://market-cairo:ZP5x0OXPOLy5YQkO@cluster0.v3mzjbs.mongodb.net/market-cairo?appName=Cluster0
JWT_SECRET=market-cairo-jwt-secret-key-2026
JWT_EXPIRE=30d

# Backend CORS - frontend এর domain
FRONTEND_URL=https://yourdomain.com

# Frontend build args - backend এর domain
NEXT_PUBLIC_API_URL=https://api.yourdomain.com/api
NEXT_PUBLIC_SOCKET_URL=https://api.yourdomain.com

# Google OAuth
GOOGLE_CLIENT_ID=YOUR_GOOGLE_CLIENT_ID
GOOGLE_CLIENT_SECRET=YOUR_GOOGLE_CLIENT_SECRET

# Admin
ADMIN_EMAIL=adminmdbillah420@gmail.com
ADMIN_NAME=Admin

# SMTP (optional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-gmail-app-password
SMTP_FROM=noreply@yourdomain.com
```

---

## Step 4: Domain Setup in Coolify

### Backend Domain:
- Coolify → backend service → **Domains**
- Domain: `api.yourdomain.com`
- Port: `5000`
- HTTPS: Enable (Coolify auto SSL)

### Frontend Domain:
- Coolify → frontend service → **Domains**
- Domain: `yourdomain.com`
- Port: `3000`
- HTTPS: Enable

---

## Step 5: Hostinger DNS Setup

Hostinger → DNS Zone Editor:

| Type | Name | Value | TTL |
|------|------|-------|-----|
| A    | @    | YOUR_COOLIFY_SERVER_IP | 300 |
| A    | www  | YOUR_COOLIFY_SERVER_IP | 300 |
| A    | api  | YOUR_COOLIFY_SERVER_IP | 300 |

> Coolify server IP পাবেন: Coolify Dashboard → Settings → IP Address

---

## Step 6: Google OAuth Update

Google Cloud Console → OAuth 2.0 Client IDs:
- **Authorized JavaScript origins**: `https://yourdomain.com`
- **Authorized redirect URIs**: `https://yourdomain.com`

---

## Step 7: Deploy!

Coolify → **Deploy** বাটন চাপুন।

Build log দেখুন। সফল হলে:
- `https://yourdomain.com` → frontend
- `https://api.yourdomain.com/api/health` → `{"status":"ok"}`

---

## Troubleshooting

### Frontend build fail হলে:
- `NEXT_PUBLIC_API_URL` env var সঠিক দেওয়া আছে কিনা দেখুন
- Build args Coolify এ environment variables হিসেবে দিতে হয়

### Backend CORS error:
- `FRONTEND_URL` সঠিক domain দেওয়া আছে কিনা দেখুন (https সহ)

### Socket.io connect করতে না পারলে:
- `NEXT_PUBLIC_SOCKET_URL=https://api.yourdomain.com` দেওয়া আছে কিনা দেখুন
- Coolify এ WebSocket support enable করুন

### Images load না হলে:
- Backend domain থেকে image serve হচ্ছে কিনা দেখুন
- `https://api.yourdomain.com/uploads/...` accessible কিনা চেক করুন
