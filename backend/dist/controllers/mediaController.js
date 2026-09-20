"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPrivateMedia = exports.getPublicMedia = void 0;
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const upload_1 = require("../middleware/upload");
const Booking_1 = require("../models/Booking");
const getPublicMedia = (req, res) => {
    const { filename } = req.params;
    const filePath = path_1.default.join(upload_1.PUBLIC_UPLOAD_PATH, filename);
    if (!fs_1.default.existsSync(filePath)) {
        res.status(404).json({ success: false, message: 'Media file not found.' });
        return;
    }
    res.sendFile(filePath);
};
exports.getPublicMedia = getPublicMedia;
const getPrivateMedia = async (req, res) => {
    try {
        const { filename } = req.params;
        const user = req.user;
        const filePath = path_1.default.join(upload_1.PRIVATE_UPLOAD_PATH, filename);
        if (!fs_1.default.existsSync(filePath)) {
            res.status(404).json({ success: false, message: 'Protected file not found.' });
            return;
        }
        // Authorization checks:
        // 1. If Admin: always allow
        if (user.role === 'admin') {
            res.sendFile(filePath);
            return;
        }
        // 2. If User's own Government ID:
        if (user.idDocument?.filename === filename) {
            res.sendFile(filePath);
            return;
        }
        // 3. If Booking-associated file (vehicle photo or damage photos):
        // Check if the file is part of a booking where user is either driver or host
        const associatedBooking = await Booking_1.Booking.findOne({
            $and: [
                {
                    $or: [
                        { 'arrivalDetails.vehiclePhoto': filename },
                        { 'arrivalDetails.damagePhotos': filename },
                    ],
                },
                {
                    $or: [
                        { userId: user._id },
                        { ownerId: user._id },
                    ],
                },
            ],
        });
        if (associatedBooking) {
            res.sendFile(filePath);
            return;
        }
        // Deny unauthorized access
        res.status(403).json({
            success: false,
            message: 'Access denied. You are not authorized to view this private document.',
            code: 'FORBIDDEN_FILE_ACCESS',
        });
    }
    catch (err) {
        res.status(500).json({
            success: false,
            message: 'Failed to stream protected file.',
        });
    }
};
exports.getPrivateMedia = getPrivateMedia;
