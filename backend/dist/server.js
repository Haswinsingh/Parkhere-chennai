"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const env_1 = require("./config/env");
const db_1 = require("./config/db");
const errorHandler_1 = require("./middleware/errorHandler");
const sessionMonitor_1 = require("./jobs/sessionMonitor");
// Route imports
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
const parkingRoutes_1 = __importDefault(require("./routes/parkingRoutes"));
const bookingRoutes_1 = __importDefault(require("./routes/bookingRoutes"));
const paymentRoutes_1 = __importDefault(require("./routes/paymentRoutes"));
const notificationRoutes_1 = __importDefault(require("./routes/notificationRoutes"));
const userRoutes_1 = __importDefault(require("./routes/userRoutes"));
const verificationRoutes_1 = __importDefault(require("./routes/verificationRoutes"));
const mediaRoutes_1 = __importDefault(require("./routes/mediaRoutes"));
const app = (0, express_1.default)();
// Security and utility middleware
app.use((0, helmet_1.default)({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
}));
app.use((0, cors_1.default)({
    origin: (origin, callback) => {
        // Allow local development and configured frontend URLs
        callback(null, true);
    },
    credentials: true,
}));
app.use(express_1.default.json({ limit: '10mb' }));
app.use(express_1.default.urlencoded({ extended: true, limit: '10mb' }));
// Health check endpoint
app.get('/api/health', (_req, res) => {
    res.status(200).json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        service: 'ParkHere Backend Production API',
    });
});
// API Routes
app.use('/api/auth', authRoutes_1.default);
app.use('/api/parking', parkingRoutes_1.default);
app.use('/api/bookings', bookingRoutes_1.default);
app.use('/api/payments', paymentRoutes_1.default);
app.use('/api/notifications', notificationRoutes_1.default);
app.use('/api/users', userRoutes_1.default);
app.use('/api/verification', verificationRoutes_1.default);
app.use('/api/media', mediaRoutes_1.default);
// Fallback 404 for undefined routes
app.use('/api/*', (req, res) => {
    res.status(404).json({
        success: false,
        message: `Endpoint not found: ${req.method} ${req.originalUrl}`,
        code: 'ROUTE_NOT_FOUND',
    });
});
// Global sanitized error handler
app.use(errorHandler_1.errorHandler);
// Start server
const startServer = async () => {
    try {
        await (0, db_1.connectDB)();
        // Start background monitor job for 10-minute warning alerts and session completion
        (0, sessionMonitor_1.startSessionMonitor)();
        const server = app.listen(env_1.ENV.PORT, () => {
            console.log(`====================================================`);
            console.log(`  PARKHERE PRODUCTION BACKEND API`);
            console.log(`  "Smart Parking for Smarter Cities"`);
            console.log(`  Server listening on http://localhost:${env_1.ENV.PORT}`);
            console.log(`  Environment: ${env_1.ENV.NODE_ENV}`);
            console.log(`====================================================`);
        });
        return server;
    }
    catch (err) {
        console.error('Failed to initialize server:', err);
        process.exit(1);
    }
};
startServer();
exports.default = app;
