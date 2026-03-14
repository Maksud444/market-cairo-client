# Market Cairo - Egyptian Second-hand Marketplace

A full-stack marketplace application for buying and selling second-hand items in Cairo, Egypt. Built with Next.js, Node.js/Express, and MongoDB.

![Market Cairo](https://via.placeholder.com/1200x600/E00000/ffffff?text=Market+Cairo)

## 🎯 Features

### Core Features
- **User Authentication**: Email/password registration and login with JWT
- **Listing Management**: Create, edit, delete listings with multiple images
- **Search & Filters**: Search by keyword, category, price range, condition, location
- **Messaging System**: In-app chat between buyers and sellers
- **Favorites**: Save listings for later
- **User Profiles**: View seller profiles, ratings, and listings

### UI/UX Features
- Responsive design (mobile-first)
- Mobile bottom navigation with floating sell button
- Desktop sidebar filters
- Real-time messaging with Socket.io
- Loading states and skeleton screens
- Toast notifications

## 🛠️ Tech Stack

### Frontend
- **Next.js 14** - React framework
- **Tailwind CSS** - Styling
- **Zustand** - State management
- **Axios** - HTTP client
- **Socket.io-client** - Real-time communication
- **React Icons** - Icons
- **React Hot Toast** - Notifications

### Backend
- **Node.js** - Runtime
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM
- **JWT** - Authentication
- **Socket.io** - Real-time messaging
- **Multer** - File uploads

## 📁 Project Structure

```
market-cairo/
├── backend/
│   ├── src/
│   │   ├── middleware/
│   │   │   ├── auth.js
│   │   │   └── upload.js
│   │   ├── models/
│   │   │   ├── Listing.js
│   │   │   ├── Message.js
│   │   │   └── User.js
│   │   ├── routes/
│   │   │   ├── auth.js
│   │   │   ├── categories.js
│   │   │   ├── listings.js
│   │   │   ├── messages.js
│   │   │   └── users.js
│   │   ├── seed.js
│   │   └── server.js
│   └── package.json
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── AuthModal.jsx
│   │   │   ├── BottomNav.jsx
│   │   │   ├── Footer.jsx
│   │   │   ├── Header.jsx
│   │   │   ├── Layout.jsx
│   │   │   └── ListingCard.jsx
│   │   ├── lib/
│   │   │   ├── api.js
│   │   │   └── store.js
│   │   ├── pages/
│   │   │   ├── listing/
│   │   │   │   └── [id].js
│   │   │   ├── _app.js
│   │   │   ├── favorites.js
│   │   │   ├── index.js
│   │   │   ├── messages.js
│   │   │   ├── post.js
│   │   │   ├── profile.js
│   │   │   └── search.js
│   │   └── styles/
│   │       └── globals.css
│   ├── next.config.js
│   ├── package.json
│   ├── postcss.config.js
│   └── tailwind.config.js
└── README.md
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)
- npm or yarn

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd market-cairo
```

2. **Install backend dependencies**
```bash
cd backend
npm install
```

3. **Install frontend dependencies**
```bash
cd ../frontend
npm install
```

4. **Configure environment variables**

Create `.env` file in `backend/`:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/market-cairo
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRE=30d
```

5. **Seed the database (optional)**
```bash
cd backend
node src/seed.js
```

6. **Start the development servers**

Terminal 1 (Backend):
```bash
cd backend
npm run dev
```

Terminal 2 (Frontend):
```bash
cd frontend
npm run dev
```

7. **Open in browser**
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000/api

### Test Credentials
```
Email: mohamed.ahmed@example.com
Password: password123
```

## 📱 Pages

| Page | Route | Description |
|------|-------|-------------|
| Home | `/` | Featured and recent listings, categories |
| Search | `/search` | Browse listings with filters |
| Listing Detail | `/listing/[id]` | Full listing details |
| Post Ad | `/post` | Create new listing |
| Messages | `/messages` | Chat conversations |
| Profile | `/profile` | User profile and listings |
| Favorites | `/favorites` | Saved listings |

## 🎨 Design System

### Colors
- **Primary Red**: `#E00000`
- **Dark Gray**: `#121212`
- **Background**: `#F9FAFB`
- **Text Primary**: `#111827`
- **Text Secondary**: `#6B7280`

### Typography
- Font: Inter
- Headings: 600-700 weight
- Body: 400-500 weight

## 📡 API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login user |
| GET | `/api/auth/me` | Get current user |
| PUT | `/api/auth/update` | Update profile |

### Listings
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/listings` | Get all listings |
| GET | `/api/listings/featured` | Get featured listings |
| GET | `/api/listings/:id` | Get listing by ID |
| POST | `/api/listings` | Create listing |
| PUT | `/api/listings/:id` | Update listing |
| DELETE | `/api/listings/:id` | Delete listing |
| POST | `/api/listings/:id/favorite` | Toggle favorite |

### Messages
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/messages/conversations` | Get all conversations |
| GET | `/api/messages/conversations/:id` | Get conversation messages |
| POST | `/api/messages/conversations` | Start new conversation |
| POST | `/api/messages/:conversationId` | Send message |

## 🔒 Security

- JWT-based authentication
- Password hashing with bcrypt
- Input validation with express-validator
- CORS configuration
- Protected routes

## 📝 Categories

- Furniture
- Electronics
- Books
- Kitchen
- Clothing
- Sports
- Toys
- Other

## 📍 Locations (Cairo Areas)

- New Cairo
- Maadi
- Heliopolis
- Zamalek
- Downtown
- 6th of October
- Sheikh Zayed
- Nasr City
- Mohandessin
- Dokki
- Giza

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 👏 Acknowledgments

- Design inspired by Figma marketplace UI patterns
- Built for the Egyptian market with EGP currency support
