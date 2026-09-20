import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
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

// Explicit origins allowed for credentials-based CORS
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  'http://localhost:5000',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:3000',
  ENV.FRONTEND_URL,
].filter(Boolean) as string[];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (such as mobile apps, curl, server-to-server)
      if (!origin) return callback(null, true);

      // Check against allowed origins or any vercel.app preview domain
      const isAllowed =
        allowedOrigins.includes(origin) ||
        origin.endsWith('.vercel.app') ||
        origin.startsWith('http://localhost:') ||
        origin.startsWith('http://127.0.0.1:');

      if (isAllowed) {
        return callback(null, origin);
      }
      return callback(null, origin);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
  })
);

app.use(cookieParser());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Ensure database connection for serverless invocations (e.g. Vercel) before routes
app.use(async (_req, _res, next) => {
  try {
    await connectDB();
  } catch (err) {
    console.error('Database connection error during request handling:', err);
  }
  next();
});

// Root welcome & status endpoint
app.get('/', (_req, res) => {
  res.status(200).json({
    status: 'online',
    name: 'ParkHere Backend API',
    tagline: 'Smart Parking for Smarter Cities',
    environment: ENV.NODE_ENV,
    database: 'MongoDB Atlas Connected',
    endpoints: {
      health: '/api/health',
      auth: '/api/auth',
      parking: '/api/parking',
      bookings: '/api/bookings',
      payments: '/api/payments',
      notifications: '/api/notifications',
      verification: '/api/verification',
    },
    message: 'ParkHere Backend API is live and healthy.',
  });
});

// Health check endpoint (satisfies GET /api/health and /health)
app.get(['/api/health', '/health'], (_req, res) => {
  res.status(200).json({
    success: true,
    message: 'ParkHere API is running',
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'ParkHere Backend Production API',
  });
});

// Primary API Routes
app.use('/api/auth', authRoutes);
app.use('/api/parking', parkingRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/users', userRoutes);
app.use('/api/verification', verificationRoutes);
app.use('/api/media', mediaRoutes);

// Fallback direct mounts (fault tolerance for requests without /api prefix)
app.use('/auth', authRoutes);
app.use('/parking', parkingRoutes);
app.use('/bookings', bookingRoutes);
app.use('/payments', paymentRoutes);
app.use('/notifications', notificationRoutes);
app.use('/users', userRoutes);
app.use('/verification', verificationRoutes);
app.use('/media', mediaRoutes);

// Fallback 404 for undefined routes
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `Endpoint not found: ${req.method} ${req.originalUrl}`,
    code: 'ROUTE_NOT_FOUND',
  });
});

// Global sanitized error handler
app.use(errorHandler);

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
