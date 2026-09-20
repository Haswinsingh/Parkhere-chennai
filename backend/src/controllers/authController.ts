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

    if (password !== confirmPassword) {
      res.status(400).json({
        success: false,
        message: 'Passwords do not match.',
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

    // Role-specific enforcement for Parking Holder
    let idDocumentData: any = undefined;
    const uploadedFiles = req.files as { [fieldname: string]: Express.Multer.File[] } | undefined;

    if (assignedRole === 'parking_holder') {
      // Compulsory Section A
      if (!numberOfVehicles || !parkingPreference || !securityPreference) {
        res.status(400).json({
          success: false,
          message: 'Parking Holder signup requires Section A preferences: number of vehicles, parking preference, and security preference.',
        });
        return;
      }

      // Compulsory Section B
      if (!landmark) {
        res.status(400).json({
          success: false,
          message: 'A landmark is compulsory for host verification.',
        });
        return;
      }

      // Government ID upload is compulsory
      const idDocFile = uploadedFiles?.['idDocument']?.[0];
      if (!idDocFile) {
        res.status(400).json({
          success: false,
          message: 'Government ID document (Aadhaar / ID) is compulsory for host verification.',
        });
        return;
      }

      idDocumentData = {
        filename: idDocFile.filename,
        originalName: idDocFile.originalname,
        path: idDocFile.path,
        mimeType: idDocFile.mimetype,
        uploadedAt: new Date(),
      };

      // Compulsory Parking Photos (at least 2 photos)
      const parkingPhotoFiles = uploadedFiles?.['photos'] || [];
      if (parkingPhotoFiles.length < 2) {
        res.status(400).json({
          success: false,
          message: 'At least 2 parking photos are required for host verification.',
        });
        return;
      }
    }

    // Hash password
    const salt = await bcrypt.genSalt(12);
    const passwordHash = await bcrypt.hash(password, salt);

    const parkingPhotoFilenames = (uploadedFiles?.['photos'] || []).map((f) => f.filename);

    // Create user
    const newUser = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      phone: phone.trim(),
      passwordHash,
      role: assignedRole,
      isActive: true,
      verificationStatus: assignedRole === 'parking_holder' ? 'pending' : undefined,
      hostPreferences:
        assignedRole === 'parking_holder'
          ? {
              numberOfVehicles: Number(numberOfVehicles),
              parkingPreference,
              securityPreference,
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

    res.status(201).json({
      success: true,
      message: 'Account created successfully.',
      data: {
        token,
        user: newUser,
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
    const { identifier, password, role } = req.body;

    if (!identifier || !password) {
      res.status(400).json({
        success: false,
        message: 'Please provide your email/phone and password.',
      });
      return;
    }

    const cleanIdentifier = identifier.trim();

    // Query by email (case-insensitive) or phone
    const user = await User.findOne({
      $or: [
        { email: cleanIdentifier.toLowerCase() },
        { phone: cleanIdentifier },
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

    res.status(200).json({
      success: true,
      message: 'Logged in successfully.',
      data: {
        token,
        user,
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

export const getMe = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Not authenticated.',
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: {
        user: req.user,
      },
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve user profile.',
    });
  }
};

export const logout = async (_req: Request, res: Response): Promise<void> => {
  res.status(200).json({
    success: true,
    message: 'Signed out successfully.',
  });
};
