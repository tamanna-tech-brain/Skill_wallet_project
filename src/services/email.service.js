const transporter = require('../config/mailer');
const User = require('../models/User');
const logger = require('../utils/logger');

const sendBookingConfirmation = async (userId, booking, showtime) => {
  try {
    const user = await User.findById(userId).select('name email');
    if (!user) return;

    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: user.email,
      subject: `🎬 Booking Confirmed — ${booking.bookingRef}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 8px;">
          <h2 style="color: #e50914;">🎬 IMovies — Booking Confirmed!</h2>
          <p>Hi <strong>${user.name}</strong>, your booking is confirmed.</p>
          <hr/>
          <table style="width:100%; border-collapse:collapse;">
            <tr><td><strong>Booking Ref:</strong></td><td>${booking.bookingRef}</td></tr>
            <tr><td><strong>Movie:</strong></td><td>${showtime.movie?.title || 'N/A'}</td></tr>
            <tr><td><strong>Theater:</strong></td><td>${showtime.theater?.name || 'N/A'}</td></tr>
            <tr><td><strong>Showtime:</strong></td><td>${new Date(showtime.startTime).toLocaleString()}</td></tr>
            <tr><td><strong>Seats:</strong></td><td>${booking.seatNumbers.join(', ')}</td></tr>
            <tr><td><strong>Total Paid:</strong></td><td>₹${booking.totalAmount}</td></tr>
          </table>
          <hr/>
          <p style="color:#888;">Please arrive 15 minutes before showtime. Enjoy the movie! 🍿</p>
        </div>
      `,
    });
    logger.info(`✉️  Booking confirmation email sent to ${user.email}`);
  } catch (err) {
    logger.warn(`⚠️  Failed to send booking email: ${err.message}`);
  }
};

const sendPasswordReset = async (email, name, resetUrl) => {
  try {
    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: email,
      subject: '🔐 IMovies — Reset Your Password',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 8px;">
          <h2 style="color: #e50914;">Reset Your Password</h2>
          <p>Hi <strong>${name}</strong>,</p>
          <p>You requested a password reset. Click the button below (valid for 1 hour):</p>
          <a href="${resetUrl}" style="display:inline-block;padding:12px 24px;background:#e50914;color:#fff;text-decoration:none;border-radius:4px;margin:16px 0;">Reset Password</a>
          <p style="color:#888;">If you did not request this, ignore this email.</p>
        </div>
      `,
    });
    logger.info(`✉️  Password reset email sent to ${email}`);
  } catch (err) {
    logger.warn(`⚠️  Failed to send reset email: ${err.message}`);
  }
};

module.exports = { sendBookingConfirmation, sendPasswordReset };
