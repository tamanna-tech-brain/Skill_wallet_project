const express = require('express');
const router = express.Router();
const Movie = require('../models/Movie');
const Showtime = require('../models/Showtime');
const Booking = require('../models/Booking');
const Seat = require('../models/Seat');
const User = require('../models/User');
const jwt = require('jsonwebtoken');

// ─── Auth Helper ─────────────────────────────────────────────────────────────
const getUser = (req) => {
  try {
    const token = req.cookies?.token || req.headers['x-auth-token'];
    if (!token) return null;
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch { return null; }
};

// ─── Middleware to attach user to all views ───────────────────────────────────
router.use((req, res, next) => {
  res.locals.user = getUser(req);
  res.locals.currentPath = req.path;
  next();
});

// ─── Home Page ────────────────────────────────────────────────────────────────
router.get('/', async (req, res) => {
  try {
    const [nowShowing, upcoming] = await Promise.all([
      Movie.find({ status: 'now_showing', isActive: true }).limit(8).lean(),
      Movie.find({ status: 'upcoming',    isActive: true }).limit(6).lean(),
    ]);
    res.render('home', { title: 'IMovies — Book Cinema Tickets Online', nowShowing, upcoming });
  } catch (err) {
    res.render('home', { title: 'IMovies', nowShowing: [], upcoming: [] });
  }
});

// ─── Movies Listing ───────────────────────────────────────────────────────────
router.get('/movies', async (req, res) => {
  try {
    const { genre, language, status = 'now_showing', q } = req.query;
    const filter = { isActive: true };
    if (status)   filter.status = status;
    if (genre)    filter.genre  = { $in: [genre] };
    if (language) filter.language = { $in: [language] };
    if (q)        filter.$text = { $search: q };

    const movies = await Movie.find(filter).sort({ 'rating.imdb': -1 }).lean();
    res.render('movies', { title: 'Movies — IMovies', movies, query: req.query });
  } catch (err) {
    res.render('movies', { title: 'Movies', movies: [], query: {} });
  }
});

// ─── Movie Detail ─────────────────────────────────────────────────────────────
router.get('/movies/:id', async (req, res) => {
  try {
    const movie = await Movie.findById(req.params.id).lean();
    if (!movie) return res.redirect('/movies');
    const showtimes = await Showtime.find({ movie: req.params.id, status: 'scheduled', startTime: { $gt: new Date() } })
      .populate('theater', 'name address')
      .populate('screen', 'screenName format')
      .sort({ startTime: 1 })
      .limit(20)
      .lean();
    res.render('movie-detail', { title: `${movie.title} — IMovies`, movie, showtimes });
  } catch (err) {
    res.redirect('/movies');
  }
});

// ─── Seat Selection ───────────────────────────────────────────────────────────
router.get('/showtimes/:id/seats', async (req, res) => {
  try {
    const user = res.locals.user;
    if (!user) return res.redirect('/login?redirect=' + encodeURIComponent(req.originalUrl));

    await Seat.updateMany(
      { showtime: req.params.id, status: 'locked', lockedUntil: { $lt: new Date() } },
      { $set: { status: 'available', lockedBy: null, lockedUntil: null } }
    );

    const showtime = await Showtime.findById(req.params.id)
      .populate('movie', 'title posterUrl duration')
      .populate('theater', 'name address')
      .populate('screen', 'screenName format')
      .lean();
    if (!showtime) return res.redirect('/movies');

    const seats = await Seat.find({ showtime: req.params.id })
      .sort({ row: 1, column: 1 }).lean();

    res.render('seat-selection', { title: `Select Seats — ${showtime.movie?.title}`, showtime, seats });
  } catch (err) {
    res.redirect('/movies');
  }
});

// ─── Booking Confirmation View ────────────────────────────────────────────────
router.get('/bookings/:id/confirm', async (req, res) => {
  try {
    const user = res.locals.user;
    if (!user) return res.redirect('/login');
    const booking = await Booking.findOne({ _id: req.params.id, user: user.sub })
      .populate('showtime').populate('movie', 'title posterUrl').populate('theater', 'name');
    if (!booking) return res.redirect('/my-bookings');
    res.render('booking-confirm', { title: 'Booking Confirmed — IMovies', booking });
  } catch (err) { res.redirect('/my-bookings'); }
});

// ─── My Bookings ──────────────────────────────────────────────────────────────
router.get('/my-bookings', async (req, res) => {
  try {
    const user = res.locals.user;
    if (!user) return res.redirect('/login');
    const bookings = await Booking.find({ user: user.sub })
      .populate('movie', 'title posterUrl')
      .populate('theater', 'name')
      .populate('showtime', 'startTime language format')
      .sort({ createdAt: -1 })
      .lean();
    res.render('my-bookings', { title: 'My Bookings — IMovies', bookings });
  } catch (err) {
    res.render('my-bookings', { title: 'My Bookings', bookings: [] });
  }
});

// ─── Auth Pages & Actions ───────────────────────────────────────────────────
const authService = require('../services/auth.service');
const bookingService = require('../services/booking.service');

router.get('/login', (req, res) => {
  if (res.locals.user) return res.redirect('/');
  res.render('login', { title: 'Login — IMovies', redirect: req.query.redirect || '/', error: null });
});

router.post('/login', async (req, res) => {
  try {
    const { email, password, redirect: redirectUrl = '/' } = req.body;
    const { token, user } = await authService.login({ email, password });
    res.cookie('token', token, {
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60 * 1000,
      sameSite: 'lax',
    });
    res.redirect(redirectUrl || '/');
  } catch (err) {
    res.render('login', {
      title: 'Login — IMovies',
      redirect: req.body.redirect || '/',
      error: err.message || 'Invalid credentials',
    });
  }
});

router.get('/register', (req, res) => {
  if (res.locals.user) return res.redirect('/');
  res.render('register', { title: 'Register — IMovies', error: null });
});

router.post('/register', async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;
    const { token, user } = await authService.register({ name, email, password, phone });
    res.cookie('token', token, {
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60 * 1000,
      sameSite: 'lax',
    });
    res.redirect('/');
  } catch (err) {
    res.render('register', {
      title: 'Register — IMovies',
      error: err.message || 'Registration failed',
    });
  }
});

router.get('/logout', (req, res) => {
  res.clearCookie('token');
  res.redirect('/');
});

// ─── Booking Actions ──────────────────────────────────────────────────────────
router.post('/bookings/:id/cancel', async (req, res) => {
  try {
    const user = res.locals.user;
    if (!user) return res.redirect('/login');
    await bookingService.cancelBooking(req.params.id, user.sub, req.body.reason || 'User cancelled');
    res.redirect('/my-bookings');
  } catch (err) {
    res.redirect('/my-bookings');
  }
});

// ─── Admin Pages ──────────────────────────────────────────────────────────────
router.get('/admin', async (req, res) => {
  try {
    const user = res.locals.user;
    if (!user || user.role !== 'admin') return res.redirect('/login');
    const [totalUsers, totalMovies, totalBookings, revenueData] = await Promise.all([
      User.countDocuments({ role: 'user' }),
      Movie.countDocuments({ isActive: true }),
      Booking.countDocuments({ status: 'confirmed' }),
      Booking.aggregate([{ $match: { status: 'confirmed' } }, { $group: { _id: null, total: { $sum: '$totalAmount' } } }]),
    ]);
    const recentBookings = await Booking.find({ status: 'confirmed' })
      .populate('user', 'name email')
      .populate('movie', 'title')
      .sort({ createdAt: -1 }).limit(10).lean();
    res.render('admin/dashboard', {
      title: 'Admin Dashboard — IMovies',
      stats: { totalUsers, totalMovies, totalBookings, totalRevenue: revenueData[0]?.total || 0 },
      recentBookings,
    });
  } catch (err) { res.redirect('/login'); }
});

router.get('/admin/movies', async (req, res) => {
  try {
    const user = res.locals.user;
    if (!user || user.role !== 'admin') return res.redirect('/login');
    const movies = await Movie.find().sort({ createdAt: -1 }).lean();
    res.render('admin/movies', { title: 'Manage Movies — IMovies', movies });
  } catch (err) { res.redirect('/admin'); }
});

router.get('/admin/movies/new', (req, res) => {
  const user = res.locals.user;
  if (!user || user.role !== 'admin') return res.redirect('/login');
  res.render('admin/movie-form', { title: 'Add Movie — IMovies', movie: null, error: null });
});

router.post('/admin/movies/new', async (req, res) => {
  const user = res.locals.user;
  if (!user || user.role !== 'admin') return res.redirect('/login');
  try {
    const { title, description, duration, releaseDate, genre, language, formats, posterUrl, trailerUrl, imdbRating, status } = req.body;
    await Movie.create({
      title,
      description,
      duration: Number(duration),
      releaseDate: new Date(releaseDate),
      genre: Array.isArray(genre) ? genre : (genre ? genre.split(',').map(s => s.trim()) : []),
      language: Array.isArray(language) ? language : (language ? language.split(',').map(s => s.trim()) : ['English']),
      formats: Array.isArray(formats) ? formats : (formats ? formats.split(',').map(s => s.trim()) : ['2D']),
      posterUrl,
      trailerUrl,
      'rating.imdb': Number(imdbRating) || 8.0,
      status: status || 'now_showing',
    });
    res.redirect('/admin/movies');
  } catch (err) {
    res.render('admin/movie-form', { title: 'Add Movie — IMovies', movie: req.body, error: err.message });
  }
});

router.post('/admin/movies/:id/delete', async (req, res) => {
  const user = res.locals.user;
  if (!user || user.role !== 'admin') return res.redirect('/login');
  try {
    await Movie.findByIdAndUpdate(req.params.id, { isActive: false });
    res.redirect('/admin/movies');
  } catch (err) {
    res.redirect('/admin/movies');
  }
});

module.exports = router;
