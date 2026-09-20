import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import path from 'path';
import { ENV } from './config/env';
import { connectDB } from './config/db';
import { errorHandler } from './middleware/errorHandler';
import { startSessionMonitor } from './jobs/sessionMonitor';

// Route imports
import authRoutes from './routes/authRoutes';
import parkingRoutes from './routes/parkingRoutes';
import bookingRoutes from './routes/bookingRoutes';
import paymentRoutes from './routes/paymentRoutes';
import notificationRoutes from './routes/notificationRoutes';
import userRoutes from './routes/userRoutes';
import verificationRoutes from './routes/verificationRoutes';
import mediaRoutes from './routes/mediaRoutes';

const app = express();

// Security and utility middleware
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  })
);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow local development and configured frontend URLs
      callback(null, true);
    },
    credentials: true,
  })
);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check endpoint
app.get('/api/health', (_req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'ParkHere Backend Production API',
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/parking', parkingRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/users', userRoutes);
app.use('/api/verification', verificationRoutes);
app.use('/api/media', mediaRoutes);

// Fallback 404 for undefined routes
app.use('/api/*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `Endpoint not found: ${req.method} ${req.originalUrl}`,
    code: 'ROUTE_NOT_FOUND',
  });
});

// Global sanitized error handler
app.use(errorHandler);

// Ensure database connection for serverless invocations
app.use(async (_req, _res, next) => {
  try {
    await connectDB();
  } catch (err) {
    console.error('Serverless database connection error:', err);
  }
  next();
});

// Start server
const startServer = async () => {
  try {
    await connectDB();

    // Start background monitor job for 10-minute warning alerts and session completion
    startSessionMonitor();

    const server = app.listen(ENV.PORT, () => {
      console.log(`====================================================`);
      console.log(`  PARKHERE PRODUCTION BACKEND API`);
      console.log(`  "Smart Parking for Smarter Cities"`);
      console.log(`  Server listening on http://localhost:${ENV.PORT}`);
      console.log(`  Environment: ${ENV.NODE_ENV}`);
      console.log(`====================================================`);
    });

    return server;
  } catch (err) {
    console.error('Failed to initialize server:', err);
    process.exit(1);
  }
};

// If running in local dev, VPS, or container (Render/Railway), start HTTP listener
if (process.env.VERCEL !== '1') {
  startServer();
}

export default app;
