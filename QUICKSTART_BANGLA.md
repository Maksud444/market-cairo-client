# Market Cairo - দ্রুত শুরু করুন
# Quick Start Guide (বাংলা)

এই গাইড আপনাকে দ্রুত প্রজেক্ট চালু করতে সাহায্য করবে।

---

## 🚀 সবচেয়ে সহজ উপায় (Docker দিয়ে)

### যা লাগবে:
- Docker Desktop ইন্সটল থাকতে হবে
- কম্পিউটারে ৪GB+ RAM

### ৩টি স্টেপে চালু করুন:

**১. প্রজেক্ট ফোল্ডারে যান:**
```bash
cd market-cairo
```

**২. Docker দিয়ে সব চালু করুন:**
```bash
docker-compose up -d
```

**৩. ব্রাউজারে খুলুন:**
```
http://localhost:3000
```

### থামাতে চাইলে:
```bash
docker-compose down
```

---

## 🛠️ ডকার ছাড়া চালাতে চাইলে

### যা লাগবে:
- Node.js 18+ ইন্সটল থাকতে হবে
- MongoDB ইন্সটল থাকতে হবে (অথবা MongoDB Atlas একাউন্ট)

### Backend চালান:

**১. Backend ফোল্ডারে যান:**
```bash
cd backend
```

**২. Package ইন্সটল করুন:**
```bash
npm install
```

**৩. `.env` ফাইল চেক করুন:**
ফাইলটি ইতিমধ্যে আছে। যদি MongoDB Atlas ব্যবহার করেন, তাহলে `MONGODB_URI` আপডেট করুন।

**৪. Backend চালু করুন:**
```bash
npm start
```

✅ Backend চলছে: `http://localhost:5000`

---

### Frontend চালান:

**নতুন টার্মিনাল খুলুন** এবং:

**১. Frontend ফোল্ডারে যান:**
```bash
cd frontend
```

**২. Package ইন্সটল করুন:**
```bash
npm install
```

**৩. Frontend চালু করুন:**
```bash
npm run dev
```

✅ Website চলছে: `http://localhost:3000`

---

## 📝 Test করার জন্য Sample Data

Database-এ sample data দিতে চাইলে:

```bash
cd backend
node src/seed.js
```

এটি আপনার database-এ কিছু নমুনা listings, users এবং messages যোগ করবে।

---

## ⚠️ সমস্যা হলে

### MongoDB connect হচ্ছে না?

**সমাধান ১:** Local MongoDB চালু আছে কিনা দেখুন:
```bash
# Windows
net start MongoDB

# Mac
brew services start mongodb-community
```

**সমাধান ২:** MongoDB Atlas ব্যবহার করুন (সহজ!):
1. [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) এ একটি free cluster তৈরি করুন
2. Connection string কপি করুন
3. `backend/.env` ফাইলে `MONGODB_URI` আপডেট করুন

### Port already in use?

যদি বলে "Port 5000 already in use", তাহলে সেই প্রসেস বন্ধ করুন:

**Windows:**
```bash
netstat -ano | findstr :5000
taskkill /PID <যে_নাম্বার_দেখাবে> /F
```

**Mac/Linux:**
```bash
lsof -ti:5000 | xargs kill -9
```

### Frontend Backend এর সাথে connect হচ্ছে না?

নিশ্চিত করুন:
- ✅ Backend চলছে `http://localhost:5000` এ
- ✅ Frontend চলছে `http://localhost:3000` এ
- ✅ দুটি আলাদা terminal window এ চলছে

---

## 🎯 প্রথমবার কি করবেন?

1. **Website খুলুন:** `http://localhost:3000`
2. **Register করুন:** উপরে "Sign Up" ক্লিক করুন
3. **Profile সেটআপ করুন:** নাম, ফোন নাম্বার, location দিন
4. **Listing পোস্ট করুন:** নিচে "+" বাটনে ক্লিক করুন
5. **Browse করুন:** অন্যদের listings দেখুন

---

## 📱 Features

✅ User Registration & Login
✅ Post Listings (ছবি সহ)
✅ Search & Filter (Category, Price, Location)
✅ Real-time Messaging
✅ Favorites/Bookmarks
✅ User Profiles & Ratings
✅ Mobile Responsive
✅ 8 Categories (Furniture, Electronics, Books, etc.)
✅ 18+ Cairo Locations

---

## 📚 আরো তথ্য

- **Full Documentation:** `README.md` দেখুন
- **Deployment Guide:** `DEPLOYMENT.md` দেখুন
- **API Documentation:** README এর API section দেখুন

---

## 🔑 Default Admin Login (যদি seed করে থাকেন)

```
Email: admin@market-cairo.com
Password: admin123
```

**⚠️ সতর্কতা:** Production এ এই password পরিবর্তন করুন!

---

## 💡 Tips

1. **Development এর জন্য:** `npm run dev` ব্যবহার করুন (auto-reload হয়)
2. **Production এর জন্য:** `npm start` ব্যবহার করুন
3. **Database backup:** MongoDB data regularly backup করুন
4. **Environment variables:** `.env` ফাইল সবসময় secret রাখুন

---

## 🆘 সাহায্য লাগলে

- `README.md` ফাইল দেখুন
- `DEPLOYMENT.md` ফাইল দেখুন
- Backend logs দেখুন: terminal এ errors দেখাবে
- Frontend console দেখুন: Browser এর Developer Tools (F12) খুলুন

---

**শুভকামনা! আপনার marketplace তৈরি করা শুরু করুন! 🎉**
