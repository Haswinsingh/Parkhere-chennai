import { Response } from 'express';
import path from 'path';
import fs from 'fs';
import { AuthenticatedRequest } from '../middleware/auth';
import { PRIVATE_UPLOAD_PATH, PUBLIC_UPLOAD_PATH } from '../middleware/upload';
import { Booking } from '../models/Booking';

export const getPublicMedia = (req: AuthenticatedRequest, res: Response): void => {
  const { filename } = req.params;
  const filePath = path.join(PUBLIC_UPLOAD_PATH, filename);

  if (!fs.existsSync(filePath)) {
    res.status(404).json({ success: false, message: 'Media file not found.' });
    return;
  }

  res.sendFile(filePath);
};

export const getPrivateMedia = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const { filename } = req.params;
    const user = req.user!;
    const filePath = path.join(PRIVATE_UPLOAD_PATH, filename);

    if (!fs.existsSync(filePath)) {
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
    const associatedBooking = await Booking.findOne({
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
  } catch (err: any) {
    res.status(500).json({
      success: false,
      message: 'Failed to stream protected file.',
    });
  }
};
