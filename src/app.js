const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const methodOverride = require('method-override');
const cookieParser = require('cookie-parser');
const path = require('path');

const rateLimiter = require('./middleware/rateLimiter');
const errorHandler = require('./middleware/errorHandler');
const logger = require('./utils/logger');

// API Route imports
const authRoutes     = require('./routes/auth.routes');
const movieRoutes    = require('./routes/movie.routes');
const theaterRoutes  = require('./routes/theater.routes');
const showtimeRoutes = require('./routes/showtime.routes');
const seatRoutes     = require('./routes/seat.routes');
const bookingRoutes  = require('./routes/booking.routes');
const adminRoutes    = require('./routes/admin.routes');

// View Route imports
const viewRoutes = require('./routes/view.routes');

const app = express();

// ─── View Engine ──────────────────────────────────────────────────────────────
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// ─── Static Files ─────────────────────────────────────────────────────────────
app.use(express.static(path.join(__dirname, '..', 'public')));

// ─── Security Middleware ───────────────────────────────────────────────────────
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc:  ["'self'", "'unsafe-inline'", "cdnjs.cloudflare.com", "cdn.jsdelivr.net"],
      styleSrc:   ["'self'", "'unsafe-inline'", "fonts.googleapis.com", "cdnjs.cloudflare.com"],
      fontSrc:    ["'self'", "fonts.gstatic.com", "cdnjs.cloudflare.com"],
      imgSrc:     ["'self'", "data:", "image.tmdb.org", "*"],
    },
  },
}));
app.use(cors({
  origin: (process.env.ALLOWED_ORIGINS || 'http://localhost:5000').split(','),
  credentials: true,
}));
// ─── Body Parsing ─────────────────────────────────────────────────────────────
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(methodOverride('_method'));
app.use(rateLimiter);

// Express 5 compatible mongo sanitization
app.use((req, res, next) => {
  if (req.body) mongoSanitize.sanitize(req.body);
  if (req.params) mongoSanitize.sanitize(req.params);
  next();
});

// ─── HTTP Logging ─────────────────────────────────────────────────────────────
app.use(morgan('combined', {
  stream: { write: (message) => logger.info(message.trim()) },
}));

// ─── Favicon ──────────────────────────────────────────────────────────────────
app.get('/favicon.ico', (req, res) => res.status(204).end());

// ─── Health Check ─────────────────────────────────────────────────────────────
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: '🎬 IMovies API is running',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
  });
});

// ─── View Routes (Frontend) ───────────────────────────────────────────────────
app.use('/', viewRoutes);

// ─── API Routes ───────────────────────────────────────────────────────────────
const API = '/api/v1';
app.use(`${API}/auth`,      authRoutes);
app.use(`${API}/movies`,    movieRoutes);
app.use(`${API}/theaters`,  theaterRoutes);
app.use(`${API}/showtimes`, showtimeRoutes);
app.use(`${API}/seats`,     seatRoutes);
app.use(`${API}/bookings`,  bookingRoutes);
app.use(`${API}/admin`,     adminRoutes);

// ─── 404 Handler ──────────────────────────────────────────────────────────────
app.use('/{*path}', (req, res) => {
  if (req.originalUrl.startsWith('/api')) {
    return res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found` });
  }
  res.status(404).render('404', { title: 'Page Not Found' });
});

// ─── Global Error Handler ─────────────────────────────────────────────────────
app.use(errorHandler);

module.exports = app;
