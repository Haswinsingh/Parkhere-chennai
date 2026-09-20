"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendNotification = void 0;
const Notification_1 = require("../models/Notification");
const sendNotification = async (params) => {
    try {
        await Notification_1.Notification.create({
            userId: params.userId,
            type: params.type,
            title: params.title,
            message: params.message,
            bookingId: params.bookingId,
            read: false,
        });
    }
    catch (err) {
        console.error('[NotificationService] Failed to create notification:', err);
    }
};
exports.sendNotification = sendNotification;
