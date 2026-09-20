import { Response } from 'express';
import bcrypt from 'bcryptjs';
import { AuthenticatedRequest } from '../middleware/auth';
import { User } from '../models/User';

export const getProfile = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const user = req.user!;
    res.status(200).json({
      success: true,
      data: {
        user,
      },
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve profile.',
    });
  }
};

export const updateProfile = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const user = req.user!;
    const { name, phone, upiId, settings } = req.body;

    if (name) user.name = name.trim();
    if (phone) {
      // Check phone uniqueness
      const existingPhone = await User.findOne({ phone: phone.trim(), _id: { $ne: user._id } });
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
  } catch (err: any) {
    res.status(500).json({
      success: false,
      message: err.message || 'Failed to update profile.',
    });
  }
};

export const changePassword = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const user = req.user!;
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

    const isMatch = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isMatch) {
      res.status(400).json({
        success: false,
        message: 'Current password is incorrect.',
      });
      return;
    }

    const salt = await bcrypt.genSalt(12);
    user.passwordHash = await bcrypt.hash(newPassword, salt);
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Password changed successfully.',
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      message: 'Failed to update password.',
    });
  }
};
