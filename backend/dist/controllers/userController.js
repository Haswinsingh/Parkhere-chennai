"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.changePassword = exports.updateProfile = exports.getProfile = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const User_1 = require("../models/User");
const getProfile = async (req, res) => {
    try {
        const user = req.user;
        res.status(200).json({
            success: true,
            data: {
                user,
            },
        });
    }
    catch (err) {
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve profile.',
        });
    }
};
exports.getProfile = getProfile;
const updateProfile = async (req, res) => {
    try {
        const user = req.user;
        const { name, phone, upiId, settings } = req.body;
        if (name)
            user.name = name.trim();
        if (phone) {
            // Check phone uniqueness
            const existingPhone = await User_1.User.findOne({ phone: phone.trim(), _id: { $ne: user._id } });
            if (existingPhone) {
                res.status(409).json({
                    success: false,
                    message: 'This phone number is already registered to another account.',
                });
                return;
            }
            user.phone = phone.trim();
        }
        if (upiId !== undefined) {
            user.upiId = upiId.trim();
        }
        if (settings) {
            user.settings = {
                ...user.settings,
                ...settings,
            };
        }
        if (req.file) {
            user.profileImage = req.file.filename;
        }
        await user.save();
        res.status(200).json({
            success: true,
            message: 'Profile updated successfully.',
            data: {
                user,
            },
        });
    }
    catch (err) {
        res.status(500).json({
            success: false,
            message: err.message || 'Failed to update profile.',
        });
    }
};
exports.updateProfile = updateProfile;
const changePassword = async (req, res) => {
    try {
        const user = req.user;
        const { currentPassword, newPassword, confirmNewPassword } = req.body;
        if (!currentPassword || !newPassword) {
            res.status(400).json({
                success: false,
                message: 'Current password and new password are required.',
            });
            return;
        }
        if (newPassword !== confirmNewPassword) {
            res.status(400).json({
                success: false,
                message: 'New passwords do not match.',
            });
            return;
        }
        if (newPassword.length < 6) {
            res.status(400).json({
                success: false,
                message: 'New password must be at least 6 characters long.',
            });
            return;
        }
        const isMatch = await bcryptjs_1.default.compare(currentPassword, user.passwordHash);
        if (!isMatch) {
            res.status(400).json({
                success: false,
                message: 'Current password is incorrect.',
            });
            return;
        }
        const salt = await bcryptjs_1.default.genSalt(12);
        user.passwordHash = await bcryptjs_1.default.hash(newPassword, salt);
        await user.save();
        res.status(200).json({
            success: true,
            message: 'Password changed successfully.',
        });
    }
    catch (err) {
        res.status(500).json({
            success: false,
            message: 'Failed to update password.',
        });
    }
};
exports.changePassword = changePassword;
