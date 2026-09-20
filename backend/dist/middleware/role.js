"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireRole = void 0;
const requireRole = (...allowedRoles) => {
    return (req, res, next) => {
        if (!req.user) {
            res.status(401).json({
                success: false,
                message: 'Authentication required.',
                code: 'UNAUTHORIZED',
            });
            return;
        }
        if (!allowedRoles.includes(req.user.role)) {
            res.status(403).json({
                success: false,
                message: `Access denied. Requires one of: [${allowedRoles.join(', ')}]`,
                code: 'FORBIDDEN',
            });
            return;
        }
        next();
    };
};
exports.requireRole = requireRole;
