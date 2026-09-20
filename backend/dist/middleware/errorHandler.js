"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = void 0;
const errorHandler = (err, _req, res, _next) => {
    console.error('[Error Middleware]:', err);
    const statusCode = err.statusCode || (res.statusCode >= 400 ? res.statusCode : 500);
    const message = err.message || 'An unexpected error occurred. Please try again.';
    const code = err.code || 'INTERNAL_SERVER_ERROR';
    res.status(statusCode).json({
        success: false,
        message,
        code,
    });
};
exports.errorHandler = errorHandler;
