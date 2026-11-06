require('dotenv').config();
const http = require('http');
const app = require('./app');
const { connectDB } = require('./config/db');
const Property = require('./models/Property');
const { checkSlaBreaches } = require('./services/leadRoutingService');
const { PROPERTY_STATUS } = require('./constants');

const PORT = process.env.PORT || 5000;
const server = http.createServer(app);

// Start server
const startServer = async () => {
  // Connect to MongoDB Atlas
  await connectDB();

  server.listen(PORT, () => {
    console.log(`\n============================================================`);
    console.log(`[Nagpur Real Estate Platform Backend Started]`);
    console.log(`Port: ${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`API Base URL: http://localhost:${PORT}/api/v1`);
    console.log(`============================================================\n`);
  });

  // Scheduled background task: Expiry check & SLA breach check (runs every 30 minutes)
  const runBackgroundTasks = async () => {
    try {
      const now = new Date();

      // 1. Mark expired properties
      const expiredCount = await Property.updateMany(
        {
          status: PROPERTY_STATUS.LIVE,
          expiresAt: { $lt: now },
        },
        {
          status: PROPERTY_STATUS.EXPIRED,
        }
      );

      if (expiredCount.modifiedCount > 0) {
        console.log(`[Scheduled Job]: Marked ${expiredCount.modifiedCount} listings as EXPIRED.`);
      }

      // 2. Check for overdue leads exceeding SLA
      await checkSlaBreaches();
    } catch (err) {
      console.error('[Scheduled Background Task Error]:', err.message);
    }
  };

  // Run initial check after 10 seconds, then periodic interval
  setTimeout(runBackgroundTasks, 10000);
  setInterval(runBackgroundTasks, 30 * 60 * 1000);
};

// Graceful termination
const shutdown = () => {
  console.log('Shutting down server gracefully...');
  server.close(() => {
    console.log('HTTP server closed.');
    process.exit(0);
  });
};

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

startServer();
