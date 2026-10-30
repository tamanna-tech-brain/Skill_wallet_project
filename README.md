# 🎬 IMovies — Full-Stack Cinema Ticketing & Reservation Platform

[![Node.js](https://img.shields.io/badge/Node.js-v18%2B-green.svg)](https://nodejs.org/)
[![Express.js](https://img.shields.io/badge/Express.js-v5.3-blue.svg)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose_v9-brightgreen.svg)](https://www.mongodb.com/)
[![EJS](https://img.shields.io/badge/EJS-Views_Fullstack-red.svg)](https://ejs.co/)
[![License](https://img.shields.io/badge/License-MIT-purple.svg)](LICENSE)

**IMovies** is a comprehensive, production-ready online cinema ticketing platform built with **Express.js**, **MongoDB**, and **EJS**. It features a modern, cinematic dark-themed UI, atomic real-time seat locks to eliminate race conditions, user authentication with JWT cookies, and an admin management portal.

---

## 🌟 Key Features

### 🖥️ Customer Experience (Frontend)
- **Cinematic Dark Theme**: Custom glassmorphism, responsive grid layouts, and smooth animations.
- **Dynamic Showtimes & Theaters**: Filter movies by genre, status (Now Showing vs. Upcoming), and language.
- **Interactive Live Seat Map**: Real-time seat grid categorized by **VIP ($25)**, **Premium ($18)**, and **Standard ($12)**.
- **Atomic Seat Locking**: Automatic 10-minute seat reservations with client-side countdown timer to prevent double-booking.
- **Instant M-Ticket & QR Code**: Digital confirmation boarding passes with dynamic QR codes and printable tickets.
- **Order & Booking History**: View past reservations and cancel tickets within the allowed policy window.

### ⚙️ Cinema Management (Admin Portal)
- **Live Metrics Dashboard**: Real-time box office gross revenue, confirmed bookings, active repertoire, and patron counts.
- **Movie Catalog Manager**: Add, inspect, and deactivate movies with formats (IMAX 3D, Dolby Atmos, 4DX).
- **Audit Logs**: Recent booking references, customer emails, seat details, and timestamps.

### 🛡️ Enterprise Security & Architecture
- **JWT Authentication**: Supports HTTP-only cookies, `Authorization: Bearer` headers, and `x-auth-token`.
- **Concurrency Protection**: MongoDB atomic updates ensure two users cannot reserve the same seat simultaneously.
- **Security Middleware**: Powered by Helmet CSP, XSS-Clean, Express Mongo Sanitize, and Rate Limiting.
- **Structured Error Handling**: Centralized error interceptor and custom Winston logging.

---

## 📁 Project Directory Structure

```text
c:\Project\Movie\
├── server.js                          # Application entry point & port listener
├── package.json                       # Scripts and dependencies
├── .env                               # Environment configurations
├── public/                            # Static assets
│   ├── css/
│   │   └── style.css                  # Custom responsive dark-theme stylesheet
│   └── js/
│       └── main.js                    # Client-side seat map, lock countdown & fetch logic
├── src/
│   ├── app.js                         # Express configuration, security & view engine
│   ├── config/
│   │   ├── db.js                      # MongoDB Mongoose connection
│   │   └── mailer.js                  # Nodemailer transport setup
│   ├── controllers/                   # Request controllers
│   │   ├── admin.controller.js
│   │   ├── auth.controller.js
│   │   ├── booking.controller.js
│   │   ├── movie.controller.js
│   │   ├── showtime.controller.js
│   │   └── theater.controller.js
│   ├── middleware/                    # Security, auth & error handlers
│   │   ├── auth.middleware.js         # Cookie & Bearer JWT token verification
│   │   ├── errorHandler.js            # Global error handling
│   │   ├── rateLimiter.js             # DoS prevention
│   │   ├── role.middleware.js         # RBAC (admin vs user)
│   │   └── validate.middleware.js     # Joi validation
│   ├── models/                        # Mongoose schemas
│   │   ├── Booking.js
│   │   ├── Movie.js
│   │   ├── Screen.js
│   │   ├── Seat.js
│   │   ├── Showtime.js
│   │   ├── Theater.js
│   │   └── User.js
│   ├── routes/                        # API & View routes
│   │   ├── admin.routes.js
│   │   ├── auth.routes.js
│   │   ├── booking.routes.js
│   │   ├── movie.routes.js
│   │   ├── seat.routes.js
│   │   ├── showtime.routes.js
│   │   ├── theater.routes.js
│   │   └── view.routes.js             # EJS frontend pages & form handlers
│   ├── services/                      # Business logic layer
│   │   ├── auth.service.js
│   │   ├── booking.service.js         # Atomic lock & seat confirmation logic
│   │   ├── email.service.js
│   │   ├── movie.service.js
│   │   └── showtime.service.js
│   ├── utils/
│   │   ├── apiResponse.js
│   │   ├── constants.js
│   │   ├── logger.js
│   │   └── seed.js                    # Comprehensive database seeder
│   ├── validators/                    # Joi request payload schemas
│   └── views/                         # EJS UI templates
│       ├── 404.ejs
│       ├── booking-confirm.ejs
│       ├── home.ejs
│       ├── login.ejs
│       ├── movie-detail.ejs
│       ├── movies.ejs
│       ├── my-bookings.ejs
│       ├── register.ejs
│       ├── seat-selection.ejs
│       ├── admin/
│       │   ├── dashboard.ejs
│       │   ├── movie-form.ejs
│       │   └── movies.ejs
│       └── partials/
│           ├── footer.ejs
│           ├── header.ejs
│           └── navbar.ejs
```

---

## 🚀 Quickstart Guide

### 1. Prerequisites
- **Node.js** v18+ installed
- **MongoDB** running locally (`mongodb://127.0.0.1:27017`) or a free [MongoDB Atlas](https://www.mongodb.com/atlas) connection string.

### 2. Configure Environment (`.env`)
Make sure `.env` contains your settings:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/imovies
JWT_SECRET=imovies_super_secret_jwt_key_32chars_min
JWT_EXPIRES_IN=7d
APP_URL=http://localhost:5000
SEAT_LOCK_DURATION_MS=600000
```
*(If using MongoDB Atlas, replace `MONGODB_URI` with your `mongodb+srv://<user>:<password>@cluster.mongodb.net/imovies` string).*

### 3. Populate Database (Seed Data)
Run the seed script to create initial movies, theaters, screens, showtimes, seats, and test accounts:
```bash
npm run seed
```

### 4. Start the Application
```bash
# Development mode with hot-reload:
npm run dev

# Or production mode:
npm start
```
Open **[http://localhost:5000](http://localhost:5000)** in your browser!

---

## 👥 Demo Credentials

| Role | Email | Password | Access |
|---|---|---|---|
| **Cinema Admin** | `admin@imovies.com` | `Admin@12345` | Full access (`/admin`, movie management, stats) |
| **Movie Patron** | `user@imovies.com` | `User@12345` | Seat bookings, ticket history (`/my-bookings`) |

---

## 🛣️ API Endpoints Summary

All REST API endpoints are prefixed with `/api/v1`:

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `POST` | `/api/v1/auth/register` | Register new customer account | No |
| `POST` | `/api/v1/auth/login` | Login and obtain JWT token | No |
| `GET` | `/api/v1/auth/me` | Current authenticated user profile | Yes |
| `GET` | `/api/v1/movies` | Filtered movies catalog | No |
| `GET` | `/api/v1/movies/now-showing` | Live screening titles | No |
| `GET` | `/api/v1/movies/upcoming` | Coming soon titles | No |
| `GET` | `/api/v1/movies/:id` | Movie details by ID | No |
| `GET` | `/api/v1/showtimes/:id/seats` | Live seat layout & availability | No |
| `POST` | `/api/v1/bookings/lock-seats` | Atomically reserve seats for 10 min | Yes |
| `POST` | `/api/v1/bookings` | Finalize ticket confirmation & payment | Yes |
| `GET` | `/api/v1/bookings/my` | User's booked reservations | Yes |
| `POST` | `/api/v1/bookings/:id/cancel` | Cancel booking & release seats | Yes |
| `GET` | `/api/v1/admin/dashboard` | Administrative metrics & statistics | Admin |

---

## 🔒 Atomic Concurrency & Seat Locking

To eliminate race conditions when hundreds of users view the same blockbuster premiere:
1. When a user proceeds on `/showtimes/:id/seats`, `lockSeats()` executes an atomic MongoDB conditional update:
   ```javascript
   Seat.findOneAndUpdate({
     showtime: showtimeId,
     seatNumber: seatNum,
     $or: [
       { status: 'available' },
       { status: 'locked', lockedUntil: { $lt: new Date() } }
     ]
   }, {
     $set: { status: 'locked', lockedBy: userId, lockedUntil: lockExpiry }
   });
   ```
2. If any selected seat fails to lock (already locked by another user), the transaction rolls back all locked seats immediately and returns an informative error.
3. Locks automatically expire after 10 minutes via MongoDB TTL indexes and middleware checks.

# Skill_wallet_project
#   M o v i e _ T i c k e t - B o o k i n g  
 