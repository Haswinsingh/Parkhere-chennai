"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.markAllAsRead = exports.markNotificationAsRead = exports.getMyNotifications = void 0;
const Notification_1 = require("../models/Notification");
const getMyNotifications = async (req, res) => {
    try {
        const user = req.user;
        const notifications = await Notification_1.Notification.find({ userId: user._id })
            .sort({ createdAt: -1 })
            .limit(30);
        const unreadCount = await Notification_1.Notification.countDocuments({
            userId: user._id,
            read: false,
        });
        res.status(200).json({
            success: true,
            data: {
                notifications,
                unreadCount,
            },
        });
    }
    catch (err) {
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve notifications.',
        });
    }
};
exports.getMyNotifications = getMyNotifications;
const markNotificationAsRead = async (req, res) => {
    try {
        const { id } = req.params;
        const user = req.user;
        const notification = await Notification_1.Notification.findOneAndUpdate({ _id: id, userId: user._id }, { read: true }, { new: true });
        if (!notification) {
            res.status(404).json({
                success: false,
                message: 'Notification not found.',
            });
            return;
        }
        res.status(200).json({
            success: true,
            data: {
                notification,
            },
        });
    }
    catch (err) {
        res.status(500).json({
            success: false,
            message: 'Failed to update notification.',
        });
    }
};
exports.markNotificationAsRead = markNotificationAsRead;
const markAllAsRead = async (req, res) => {
    try {
        const user = req.user;
        await Notification_1.Notification.updateMany({ userId: user._id, read: false }, { read: true });
        res.status(200).json({
            success: true,
            message: 'All notifications marked as read.',
        });
    }
    catch (err) {
        res.status(500).json({
            success: false,
            message: 'Failed to mark notifications as read.',
        });
    }
};
exports.markAllAsRead = markAllAsRead;
