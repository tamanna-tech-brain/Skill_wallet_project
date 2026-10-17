require('dotenv').config();
const app = require('./src/app');
const connectDB = require('./src/config/db');
const logger = require('./src/utils/logger');

const PORT = process.env.PORT || 5000;

// Connect to MongoDB then start server
connectDB().then(() => {
  app.listen(PORT, () => {
    logger.info(`🎬 IMovies API running on http://localhost:${PORT}`);
    logger.info(`📄 Environment: ${process.env.NODE_ENV}`);
  });
}).catch((err) => {
  logger.error('Failed to connect to MongoDB', err);
  process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  logger.error('Unhandled Rejection:', err.message);
  process.exit(1);
});
