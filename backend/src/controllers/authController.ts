import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User, IUser, UserRole } from '../models/User';
import { ENV } from '../config/env';
import { AuthenticatedRequest } from '../middleware/auth';

const generateToken = (user: IUser): string => {
  return jwt.sign(
    { id: user._id, role: user.role },
    ENV.JWT_SECRET,
    { expiresIn: ENV.JWT_EXPIRES_IN as any }
  );
};

export const sanitizeUser = (user: any) => {
  const userObj = user.toJSON ? user.toJSON() : { ...user };
  delete userObj.passwordHash;
  delete userObj.password;
  delete userObj.__v;
  if (!userObj.id && userObj._id) {
    userObj.id = userObj._id.toString();
  }
  return userObj;
};

const setTokenCookie = (res: Response, token: string) => {
  res.cookie('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
  });
};

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      name,
      email,
      phone,
      password,
      confirmPassword,
      role,
      // Parking Holder Section A:
      numberOfVehicles,
      parkingPreference,
      securityPreference,
      // Parking Holder Section B:
      landmark,
      cctvAvailable,
      gateAvailable,
      upiId,
    } = req.body;

    // Common validations
    if (!name || !email || !phone || !password) {
      res.status(400).json({
        success: false,
        message: 'Full name, email, phone, and password are required.',
      });
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.toLowerCase().trim())) {
      res.status(400).json({
        success: false,
        message: 'Please provide a valid email address.',
      });
      return;
    }

    if (password.length < 6) {
      res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long.',
      });
      return;
    }

    if (confirmPassword !== undefined && password !== confirmPassword) {
      res.status(400).json({
        success: false,
        message: 'Passwords do not match.',
      });
      return;
    }

    let assignedRole: UserRole = 'parking_needed';
    if (role === 'parking_holder') {
      assignedRole = 'parking_holder';
    } else if (role === 'admin' && req.body.adminSecret === 'parkhere_admin_2026') {
      assignedRole = 'admin';
    }

    // Check existing email or phone
    const existingUser = await User.findOne({
      $or: [{ email: email.toLowerCase().trim() }, { phone: phone.trim() }],
    });

    if (existingUser) {
      if (existingUser.email === email.toLowerCase().trim()) {
        res.status(409).json({
          success: false,
          message: 'An account with this email already exists. Please sign in.',
        });
        return;
      }
      res.status(409).json({
        success: false,
        message: 'An account with this phone number already exists. Please sign in.',
      });
      return;
    }

    // Role-specific handling for Parking Holder
    let idDocumentData: any = undefined;
    const uploadedFiles = req.files as { [fieldname: string]: Express.Multer.File[] } | undefined;

    if (assignedRole === 'parking_holder') {
      const idDocFile = uploadedFiles?.['idDocument']?.[0];
      if (idDocFile) {
        idDocumentData = {
          filename: idDocFile.filename,
          originalName: idDocFile.originalname,
          path: idDocFile.path,
          mimeType: idDocFile.mimetype,
          uploadedAt: new Date(),
        };
      }
    }

    // Hash password with 12 salt rounds
    const salt = await bcrypt.genSalt(12);
    const passwordHash = await bcrypt.hash(password, salt);

    const parkingPhotoFilenames = (uploadedFiles?.['photos'] || []).map((f) => f.filename);

    // Create user in database
    const newUser = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      phone: phone.trim(),
      passwordHash,
      role: assignedRole,
      isActive: true,
      verificationStatus: assignedRole === 'parking_holder' ? 'pending' : undefined,
      hostPreferences:
        assignedRole === 'parking_holder' && (numberOfVehicles || parkingPreference || securityPreference)
          ? {
              numberOfVehicles: numberOfVehicles ? Number(numberOfVehicles) : 1,
              parkingPreference: parkingPreference || 'Covered',
              securityPreference: securityPreference || 'Both',
            }
          : undefined,
      idDocument: idDocumentData,
      landmark: landmark ? landmark.trim() : undefined,
      cctvAvailable: cctvAvailable === 'true' || cctvAvailable === true,
      gateAvailable: gateAvailable === 'true' || gateAvailable === true,
      photos: parkingPhotoFilenames,
      upiId: upiId ? upiId.trim() : undefined,
    });

    const token = generateToken(newUser);
    setTokenCookie(res, token);
    const sanitized = sanitizeUser(newUser);

    res.status(201).json({
      success: true,
      message: 'Account created successfully.',
      token,
      user: sanitized,
      data: {
        token,
        user: sanitized,
      },
    });
  } catch (err: any) {
    console.error('Registration error:', err);
    res.status(500).json({
      success: false,
      message: err.message || 'Failed to complete registration.',
    });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const identifier = (req.body.identifier || req.body.email || '').trim();
    const { password, role } = req.body;

    if (!identifier || !password) {
      res.status(400).json({
        success: false,
        message: 'Please provide your email or phone and password.',
      });
      return;
    }

    // Query by email (case-insensitive) or phone
    const user = await User.findOne({
      $or: [
        { email: identifier.toLowerCase() },
        { phone: identifier },
      ],
    });

    if (!user) {
      res.status(401).json({
        success: false,
        message: 'Account not found. Please sign up first.',
        code: 'ACCOUNT_NOT_FOUND',
      });
      return;
    }

    if (!user.isActive) {
      res.status(403).json({
        success: false,
        message: 'Your account has been deactivated. Please contact support.',
        code: 'ACCOUNT_DEACTIVATED',
      });
      return;
    }

    // Role check if provided
    if (role && user.role !== role && user.role !== 'admin') {
      res.status(403).json({
        success: false,
        message: `This account is registered as ${user.role.replace('_', ' ')}. Please select the correct login portal.`,
        code: 'ROLE_MISMATCH',
      });
      return;
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      res.status(401).json({
        success: false,
        message: 'Invalid email/phone or password.',
        code: 'INVALID_CREDENTIALS',
      });
      return;
    }

    const token = generateToken(user);
    setTokenCookie(res, token);
    const sanitized = sanitizeUser(user);

    res.status(200).json({
      success: true,
      message: 'Logged in successfully.',
      token,
      user: sanitized,
      data: {
        token,
        user: sanitized,
      },
    });
  } catch (err: any) {
    console.error('Login error:', err);
    res.status(500).json({
      success: false,
      message: 'Unable to connect. Please try again.',
    });
  }
};

export const getCurrentUser = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Not authenticated.',
        code: 'UNAUTHORIZED',
      });
      return;
    }

    const sanitized = sanitizeUser(req.user);

    res.status(200).json({
      success: true,
      message: 'Current user profile retrieved.',
      user: sanitized,
      data: {
        user: sanitized,
      },
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve user profile.',
    });
  }
};

export const getMe = getCurrentUser;

export const logout = async (_req: Request, res: Response): Promise<void> => {
  try {
    res.clearCookie('token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    });
    res.status(200).json({
      success: true,
      message: 'Signed out successfully.',
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      message: 'Failed to complete logout.',
    });
  }
};
