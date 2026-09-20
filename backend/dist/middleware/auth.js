"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticate = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const env_1 = require("../config/env");
const User_1 = require("../models/User");
const authenticate = async (req, res, next) => {
    try {
        let token;
        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
            token = req.headers.authorization.split(' ')[1];
        }
        else if (req.cookies && req.cookies.token) {
            token = req.cookies.token;
        }
        if (!token) {
            res.status(401).json({
                success: false,
                message: 'Authentication required. Please sign in.',
                code: 'UNAUTHORIZED',
            });
            return;
        }
        const decoded = jsonwebtoken_1.default.verify(token, env_1.ENV.JWT_SECRET);
        const user = await User_1.User.findById(decoded.id);
        if (!user || !user.isActive) {
            res.status(401).json({
                success: false,
                message: 'User account not found or deactivated.',
                code: 'ACCOUNT_INVALID',
            });
            return;
        }
        req.user = user;
        next();
    }
    catch (err) {
        res.status(401).json({
            success: false,
            message: 'Invalid or expired session. Please sign in again.',
            code: 'TOKEN_EXPIRED_OR_INVALID',
        });
    }
};
exports.authenticate = authenticate;
