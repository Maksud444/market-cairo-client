# Market Cairo - Deployment Guide
# ডিপ্লয়মেন্ট গাইড

This guide covers how to run and deploy the Market Cairo application.

## Table of Contents / সূচিপত্র
1. [Local Development (Without Docker)](#local-development)
2. [Docker Deployment](#docker-deployment)
3. [Production Deployment](#production-deployment)
4. [Environment Variables](#environment-variables)

---

## Local Development (Without Docker)
## লোকাল ডেভেলপমেন্ট (ডকার ছাড়া)

### Prerequisites / প্রয়োজনীয়তা
- Node.js 18+ installed
- MongoDB installed locally OR MongoDB Atlas account
- Git (optional)

### Step 1: Install Dependencies / ধাপ ১: ডিপেন্ডেন্সি ইন্সটল

**Backend:**
```bash
cd backend
npm install
```

**Frontend:**
```bash
cd frontend
npm install
```

### Step 2: Configure Environment / ধাপ ২: এনভায়রনমেন্ট সেটআপ

Create `.env` file in backend folder / backend ফোল্ডারে `.env` ফাইল তৈরি করুন:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/market-cairo
# OR use MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/market-cairo
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRE=30d
NODE_ENV=development
```

### Step 3: Start MongoDB / ধাপ ৩: MongoDB চালু করুন

If using local MongoDB / যদি লোকাল MongoDB ব্যবহার করেন:
```bash
# Windows
net start MongoDB

# Mac/Linux
sudo systemctl start mongod
# or
brew services start mongodb-community
```

If using MongoDB Atlas, skip this step / MongoDB Atlas ব্যবহার করলে এই ধাপ এড়িয়ে যান।

### Step 4: Run Backend / ধাপ ৪: Backend চালান

```bash
cd backend
npm run dev
# or for production
npm start
```

Backend will run on: `http://localhost:5000`

### Step 5: Run Frontend / ধাপ ৫: Frontend চালান

Open a new terminal / নতুন টার্মিনাল খুলুন:
```bash
cd frontend
npm run dev
# or for production
npm run build
npm start
```

Frontend will run on: `http://localhost:3000`

### Step 6: Open in Browser / ধাপ ৬: ব্রাউজারে খুলুন

Open `http://localhost:3000` in your browser.

---

## Docker Deployment
## ডকার ডিপ্লয়মেন্ট

### Prerequisites / প্রয়োজনীয়তা
- Docker installed
- Docker Compose installed

### Step 1: Start All Services / ধাপ ১: সব সার্ভিস চালু করুন

From the project root / প্রজেক্ট রুট থেকে:

```bash
docker-compose up -d
```

This will start:
- MongoDB on port 27017
- Backend API on port 5000
- Frontend on port 3000

### Step 2: Check Status / ধাপ ২: স্ট্যাটাস দেখুন

```bash
docker-compose ps
```

### Step 3: View Logs / ধাপ ৩: লগ দেখুন

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f mongodb
```

### Step 4: Stop Services / ধাপ ৪: সার্ভিস বন্ধ করুন

```bash
docker-compose down
```

To also remove volumes (database data) / ডাটাবেস ডাটা মুছে ফেলতে:
```bash
docker-compose down -v
```

### Rebuild After Changes / পরিবর্তনের পর রিবিল্ড

```bash
docker-compose up -d --build
```

---

## Production Deployment
## প্রোডাকশন ডিপ্লয়মেন্ট

### Option 1: VPS (DigitalOcean, Linode, AWS EC2, etc.)

#### 1. Server Setup
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Install Docker & Docker Compose
sudo apt install -y docker.io docker-compose

# Install MongoDB (if not using Atlas)
wget -qO - https://www.mongodb.org/static/pgp/server-8.0.asc | sudo apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/8.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-8.0.list
sudo apt update
sudo apt install -y mongodb-org
sudo systemctl start mongod
sudo systemctl enable mongod
```

#### 2. Clone & Configure
```bash
# Clone repository
git clone <your-repo-url>
cd market-cairo

# Configure environment
cd backend
cp .env.example .env
nano .env  # Edit with production values
```

#### 3. Using Docker
```bash
docker-compose up -d
```

#### 4. Using PM2 (Without Docker)
```bash
# Install PM2
sudo npm install -g pm2

# Start backend
cd backend
pm2 start src/server.js --name market-cairo-backend

# Build and start frontend
cd ../frontend
npm run build
pm2 start npm --name market-cairo-frontend -- start

# Save PM2 configuration
pm2 save
pm2 startup
```

#### 5. Setup Nginx Reverse Proxy
```bash
sudo apt install -y nginx

# Create Nginx configuration
sudo nano /etc/nginx/sites-available/market-cairo
```

Add this configuration:
```nginx
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;

    # Frontend
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # Uploads
    location /uploads {
        proxy_pass http://localhost:5000;
    }

    # Socket.io
    location /socket.io {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
    }
}
```

Enable the site:
```bash
sudo ln -s /etc/nginx/sites-available/market-cairo /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

#### 6. Setup SSL with Let's Encrypt
```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com -d www.your-domain.com
```

### Option 2: Vercel (Frontend) + Railway/Render (Backend)

#### Frontend (Vercel)
1. Push code to GitHub
2. Connect repository to Vercel
3. Set environment variables:
   - `NEXT_PUBLIC_API_URL=https://your-backend-url.com`
4. Deploy

#### Backend (Railway/Render)
1. Connect GitHub repository
2. Set environment variables (see below)
3. Add MongoDB connection string
4. Deploy

### Option 3: Heroku

#### Backend
```bash
cd backend
heroku create market-cairo-api
heroku addons:create mongolab
git push heroku main
```

#### Frontend
```bash
cd frontend
heroku create market-cairo-web
heroku config:set NEXT_PUBLIC_API_URL=https://market-cairo-api.herokuapp.com
git push heroku main
```

---

## Environment Variables
## এনভায়রনমেন্ট ভেরিয়েবল

### Backend (.env)

```env
# Server Configuration
PORT=5000
NODE_ENV=production

# Database
MONGODB_URI=mongodb://localhost:27017/market-cairo
# For MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/market-cairo?retryWrites=true&w=majority

# JWT Authentication
JWT_SECRET=your-super-secret-jwt-key-minimum-32-characters
JWT_EXPIRE=30d

# Optional: Cloudinary (for image storage)
# CLOUDINARY_CLOUD_NAME=your-cloud-name
# CLOUDINARY_API_KEY=your-api-key
# CLOUDINARY_API_SECRET=your-api-secret

# Optional: OAuth
# GOOGLE_CLIENT_ID=your-google-client-id
# GOOGLE_CLIENT_SECRET=your-google-client-secret
# FACEBOOK_APP_ID=your-facebook-app-id
# FACEBOOK_APP_SECRET=your-facebook-app-secret
```

### Frontend (.env.local) - Optional

```env
NEXT_PUBLIC_API_URL=http://localhost:5000
```

**Note:** Frontend uses Next.js rewrites in `next.config.js`, so this is optional for local development.

---

## Database Seeding (Optional)
## ডাটাবেস সিডিং (ঐচ্ছিক)

To populate the database with sample data / নমুনা ডাটা দিয়ে ডাটাবেস পূরণ করতে:

```bash
cd backend
node src/seed.js
```

---

## Troubleshooting
## সমস্যা সমাধান

### Backend not connecting to MongoDB
```bash
# Check MongoDB status
sudo systemctl status mongod

# Check connection string in .env
# Make sure MONGODB_URI is correct
```

### Port already in use / পোর্ট ইতিমধ্যে ব্যবহৃত
```bash
# Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Mac/Linux
lsof -ti:5000 | xargs kill -9
```

### Docker issues
```bash
# Remove all containers and start fresh
docker-compose down -v
docker system prune -a
docker-compose up -d --build
```

### Frontend can't connect to backend
- Check if backend is running on port 5000
- Check `next.config.js` rewrites configuration
- Check CORS settings in backend

---

## Performance Tips
## পারফরম্যান্স টিপস

1. **Use MongoDB Atlas** instead of local MongoDB for better performance
2. **Enable compression** in Express (already implemented)
3. **Use CDN** for static assets
4. **Enable caching** for images and API responses
5. **Use PM2 cluster mode** for better CPU utilization:
   ```bash
   pm2 start src/server.js -i max --name market-cairo-backend
   ```
6. **Monitor with PM2**:
   ```bash
   pm2 monit
   ```

---

## Security Checklist
## নিরাপত্তা চেকলিস্ট

- ✅ Change JWT_SECRET to a strong random string
- ✅ Use HTTPS in production
- ✅ Enable rate limiting (consider adding)
- ✅ Validate all user inputs (already implemented)
- ✅ Use secure cookies for JWT
- ✅ Keep dependencies updated
- ✅ Enable MongoDB authentication
- ✅ Use environment variables for secrets
- ✅ Implement CORS properly

---

## Support / সাহায্য

For issues and questions / সমস্যা এবং প্রশ্নের জন্য:
- Check the main README.md
- Review API documentation
- Check logs: `docker-compose logs -f`

---

**Good luck with your deployment! / ডিপ্লয়মেন্টে শুভকামনা!** 🚀
