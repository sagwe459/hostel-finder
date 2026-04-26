# 🏠 HomeFinder Kenya — Hostel & Bedsitter Finder System

A full-stack platform that connects **students** with **landlords** to find hostels and bedsitters across Kenya — with **zero broker fees**.

---

## ✨ Features

### 🔐 Authentication
- JWT-based login / registration
- Password hashing with bcrypt (12 salt rounds)
- Role-based access: `student` and `landlord`
- Persistent sessions via localStorage

### 🏘️ Listings
- Full CRUD for landlords (create, edit, delete)
- Paginated listing grid (12 per page)
- Keyword full-text search
- Filters: price range, location, type, amenities
- Image carousel on detail page
- Availability toggle

### 💬 Messaging
- Students message landlords directly from the listing page
- Landlord inbox with unread indicators
- Reply via email/phone shown in dashboard

### ⭐ Reviews & Ratings
- Students leave one review per listing
- Star ratings (1–5) with computed average
- Reviews displayed on listing detail page

### ❤️ Saved Listings
- Students save/unsave listings with a heart button
- Dedicated "Saved" page

---

## 🗂️ Project Structure

```
hostel-finder/
├── backend/
│   ├── config/db.js
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── listingController.js
│   │   └── messageController.js
│   ├── middleware/
│   │   ├── authMiddleware.js
│   │   └── errorMiddleware.js
│   ├── models/
│   │   ├── User.js
│   │   ├── Listing.js
│   │   └── Message.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── listingRoutes.js
│   │   └── messageRoutes.js
│   ├── seed.js
│   ├── server.js
│   ├── .env
│   └── package.json
│
└── frontend/
    ├── src/
    │   ├── api/axios.js
    │   ├── components/
    │   │   ├── Navbar.jsx
    │   │   ├── Footer.jsx
    │   │   ├── ListingCard.jsx
    │   │   ├── SearchBar.jsx
    │   │   ├── FilterPanel.jsx
    │   │   ├── ImageCarousel.jsx
    │   │   ├── MessageForm.jsx
    │   │   └── ProtectedRoute.jsx
    │   ├── context/AuthContext.jsx
    │   ├── pages/
    │   │   ├── Home.jsx
    │   │   ├── Login.jsx
    │   │   ├── Register.jsx
    │   │   ├── ListingDetail.jsx
    │   │   ├── AddListing.jsx      ← also handles Edit
    │   │   ├── Dashboard.jsx
    │   │   ├── SavedListings.jsx
    │   │   └── NotFound.jsx
    │   ├── utils/helpers.js
    │   ├── App.jsx
    │   └── main.jsx
    ├── tailwind.config.js
    ├── vite.config.js
    └── package.json
```

---

## 🚀 Quick Start

### Prerequisites
| Tool | Version |
|------|---------|
| Node.js | v18+ |
| npm | v9+ |
| MongoDB | v6+ (local) OR MongoDB Atlas (cloud) |

---

### 1. Clone / Download the project

```bash
# If using git:
git clone <your-repo-url>
cd hostel-finder

# Or just navigate to the hostel-finder folder
```

---

### 2. Backend Setup

```bash
cd backend
npm install
```

#### Configure environment variables

The `.env` file is already created with defaults. Edit it if needed:

```env
MONGO_URI=mongodb://localhost:27017/hostel-finder
JWT_SECRET=hostelFinderSuperSecretKey2024_ChangeInProduction
JWT_EXPIRES_IN=7d
PORT=5000
CLIENT_URL=http://localhost:5173
```

#### MongoDB options:

**Option A — Local MongoDB:**
```bash
# Make sure MongoDB is running locally
mongod --dbpath /data/db
```

**Option B — MongoDB Atlas (cloud, recommended for production):**
1. Create a free cluster at [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. Get your connection string
3. Replace `MONGO_URI` in `.env`

---

### 3. Seed the Database

```bash
# Inside the backend folder:
node seed.js
```

This creates:
- 3 test users (2 landlords + 1 student)
- 8 realistic Kenyan hostel/bedsitter listings

**Test Credentials:**
| Role | Email | Password |
|------|-------|----------|
| Landlord | landlord@test.com | password123 |
| Student | student@test.com | password123 |
| Landlord 2 | landlord2@test.com | password123 |

---

### 4. Start the Backend

```bash
# Development (auto-restarts on file changes):
npm run dev

# Production:
npm start
```

Backend runs at: `http://localhost:5000`
Health check: `http://localhost:5000/api/health`

---

### 5. Frontend Setup

```bash
# Open a new terminal
cd frontend
npm install
npm run dev
```

Frontend runs at: `http://localhost:5173`

---

## 📡 API Reference

### Auth
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/register` | — | Register new user |
| POST | `/api/auth/login` | — | Login |
| GET | `/api/auth/me` | ✅ | Get current user |
| PUT | `/api/auth/update-profile` | ✅ | Update profile |

### Listings
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/listings` | — | Get all (search + filter) |
| GET | `/api/listings/:id` | — | Get single listing |
| POST | `/api/listings` | Landlord | Create listing |
| PUT | `/api/listings/:id` | Landlord | Update listing |
| DELETE | `/api/listings/:id` | Landlord | Delete listing |
| GET | `/api/listings/landlord/my-listings` | Landlord | Own listings |
| POST | `/api/listings/:id/reviews` | Student | Add review |
| POST | `/api/listings/:id/save` | Student | Toggle save |

### Query Parameters for GET `/api/listings`
| Param | Example | Description |
|-------|---------|-------------|
| keyword | `westlands` | Full-text search |
| location | `Nairobi` | Location filter |
| minPrice | `5000` | Minimum price |
| maxPrice | `20000` | Maximum price |
| type | `bedsitter` | Listing type |
| amenities | `WiFi,Water` | Required amenities |
| page | `1` | Page number |
| limit | `12` | Results per page |

### Messages
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/messages` | Student | Send message |
| GET | `/api/messages/inbox` | Landlord | All messages |
| GET | `/api/messages/:listingId` | Landlord | Messages by listing |

---

## 🎨 Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 18 + Vite |
| Styling | Tailwind CSS 3 |
| Routing | React Router v6 |
| HTTP Client | Axios |
| Notifications | react-hot-toast |
| Icons | react-icons (Feather) |
| Backend | Node.js + Express |
| Database | MongoDB + Mongoose |
| Auth | JWT + bcryptjs |

---

## 🔒 Security Notes

1. Change `JWT_SECRET` to a long random string in production
2. Never commit `.env` to git — add it to `.gitignore`
3. Use HTTPS in production
4. Consider rate limiting (e.g. `express-rate-limit`) for auth routes
5. For image uploads, consider Cloudinary instead of URL inputs

---

## 🌍 Deployment (Render + MongoDB Atlas)

### Backend on Render:
1. Push code to GitHub
2. Create a new **Web Service** on [render.com](https://render.com)
3. Root directory: `backend`
4. Build command: `npm install`
5. Start command: `node server.js`
6. Add environment variables from `.env`

### Frontend on Render (Static Site):
1. Create a **Static Site**
2. Root directory: `frontend`
3. Build command: `npm install && npm run build`
4. Publish directory: `dist`
5. Update `VITE_API_URL` or the Vite proxy to point to your backend URL

---

## 🐛 Troubleshooting

| Problem | Solution |
|---------|----------|
| `ECONNREFUSED` | MongoDB not running — start it with `mongod` |
| `Cannot GET /api/...` | Backend not started — run `npm run dev` in backend |
| CORS errors | Ensure `CLIENT_URL` in `.env` matches your frontend URL |
| `jwt malformed` | Clear localStorage (`hf_token`) and log in again |
| Listings not loading | Check backend console for MongoDB errors |
| Tailwind styles missing | Run `npm install` in frontend, check `tailwind.config.js` |

---

## 📝 Sample API Requests (curl)

```bash
# Register
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@test.com","password":"pass123","role":"student"}'

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"student@test.com","password":"password123"}'

# Get listings (with filters)
curl "http://localhost:5000/api/listings?location=Nairobi&maxPrice=10000&type=bedsitter"
```

---

Built with ❤️ for students and landlords across Kenya 🇰🇪
