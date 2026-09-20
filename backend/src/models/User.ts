import mongoose, { Document, Schema } from 'mongoose';

export type UserRole = 'parking_needed' | 'parking_holder' | 'admin';
export type VerificationStatus = 'pending' | 'approved' | 'rejected';
export type ParkingPref = 'Covered' | 'Open' | 'Any';
export type SecurityPref = 'CCTV' | 'Gated Parking' | 'Both';

export interface IUser extends Document {
  name: string;
  email: string;
  phone: string;
  passwordHash: string;
  role: UserRole;
  profileImage?: string;
  isActive: boolean;
  verificationStatus?: VerificationStatus;
  verificationNotes?: string;
  
  // Parking Holder Section A Preferences
  hostPreferences?: {
    numberOfVehicles?: number;
    parkingPreference?: ParkingPref;
    securityPreference?: SecurityPref;
  };

  // Parking Holder Compulsory Verification Fields
  idDocument?: {
    filename: string;
    originalName: string;
    path: string;
    mimeType: string;
    uploadedAt: Date;
  };
  landmark?: string;
  cctvAvailable?: boolean;
  gateAvailable?: boolean;
  photos?: string[]; // Initial host property photos

  // Payment settings (for holder payouts)
  upiId?: string;

  // Settings & Preferences
  settings?: {
    searchRadiusKm?: number;
    sortPreference?: 'distance' | 'price' | 'rating' | 'availability';
    notificationsEnabled?: boolean;
    theme?: 'light' | 'dark' | 'system';
  };

  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    phone: { type: String, required: true, unique: true, trim: true },
    passwordHash: { type: String, required: true },
    role: {
      type: String,
      enum: ['parking_needed', 'parking_holder', 'admin'],
      required: true,
      default: 'parking_needed',
    },
    profileImage: { type: String },
    isActive: { type: Boolean, default: true },
    verificationStatus: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: function (this: any) {
        return this.role === 'parking_holder' ? 'pending' : undefined;
      },
    },
    verificationNotes: { type: String },

    hostPreferences: {
      numberOfVehicles: { type: Number },
      parkingPreference: { type: String, enum: ['Covered', 'Open', 'Any'] },
      securityPreference: { type: String, enum: ['CCTV', 'Gated Parking', 'Both'] },
    },

    idDocument: {
      filename: { type: String },
      originalName: { type: String },
      path: { type: String },
      mimeType: { type: String },
      uploadedAt: { type: Date },
    },
    landmark: { type: String },
    cctvAvailable: { type: Boolean, default: false },
    gateAvailable: { type: Boolean, default: false },
    photos: [{ type: String }],

    upiId: { type: String, trim: true },

    settings: {
      searchRadiusKm: { type: Number, default: 5 },
      sortPreference: { type: String, enum: ['distance', 'price', 'rating', 'availability'], default: 'distance' },
      notificationsEnabled: { type: Boolean, default: true },
      theme: { type: String, enum: ['light', 'dark', 'system'], default: 'light' },
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform(_doc, ret: any) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
        delete ret.passwordHash;
        // Never leak private ID document path in public user responses
        if (ret.idDocument) {
          ret.idDocument = {
            hasUploaded: true,
            originalName: ret.idDocument.originalName,
            uploadedAt: ret.idDocument.uploadedAt,
          };
        }
        return ret;
      },
    },
  }
);

// Index on role for fast role-based queries
UserSchema.index({ role: 1 });

export const User = mongoose.model<IUser>('User', UserSchema);
