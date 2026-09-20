import mongoose from 'mongoose';
import { Notification, NotificationType } from '../models/Notification';

export const sendNotification = async (params: {
  userId: string | mongoose.Types.ObjectId;
  type: NotificationType;
  title: string;
  message: string;
  bookingId?: string | mongoose.Types.ObjectId;
}): Promise<void> => {
  try {
    await Notification.create({
      userId: params.userId,
      type: params.type,
      title: params.title,
      message: params.message,
      bookingId: params.bookingId,
      read: false,
    });
  } catch (err) {
    console.error('[NotificationService] Failed to create notification:', err);
  }
};
