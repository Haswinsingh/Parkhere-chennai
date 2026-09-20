import mongoose, { Document, Schema } from 'mongoose';

export type BookingStatus = 'upcoming' | 'arrived' | 'active' | 'completed' | 'cancelled';
export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'cancelled';
export type PaymentMethod = 'cash' | 'upi';

export interface IArrivalDetails {
  arrivedAt: Date;
  distanceMeters: number;
  userLocation: {
    latitude: number;
    longitude: number;
  };
  vehiclePhoto: string;
  damageReported: boolean;
  damageDescription?: string;
  damagePhotos?: string[];
}

export interface IBooking extends Document {
  userId: mongoose.Types.ObjectId;
  parkingId: mongoose.Types.ObjectId;
  ownerId: mongoose.Types.ObjectId;
  date: string;
  startTime: Date;
  endTime: Date;
  duration: number; // in hours
  pricePerHour: number;
  baseAmount: number;
  overtimeAmount: number;
  totalAmount: number;
  status: BookingStatus;
  paymentStatus: PaymentStatus;
  paymentMethod?: PaymentMethod;
  arrivalDetails?: IArrivalDetails;
  verifiedAt?: Date;
  verifiedBy?: mongoose.Types.ObjectId;
  parkingStartTime?: Date;
  parkingEndTime?: Date;
  tenMinuteWarningSent: boolean;
  cancelReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

const BookingSchema = new Schema<IBooking>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    parkingId: { type: Schema.Types.ObjectId, ref: 'ParkingSpace', required: true, index: true },
    ownerId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    date: { type: String, required: true },
    startTime: { type: Date, required: true, index: true },
    endTime: { type: Date, required: true, index: true },
    duration: { type: Number, required: true, min: 0.5 },
    pricePerHour: { type: Number, required: true, min: 0 },
    baseAmount: { type: Number, required: true, min: 0 },
    overtimeAmount: { type: Number, default: 0, min: 0 },
    totalAmount: { type: Number, required: true, min: 0 },
    status: {
      type: String,
      enum: ['upcoming', 'arrived', 'active', 'completed', 'cancelled'],
      default: 'upcoming',
      index: true,
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'failed', 'cancelled'],
      default: 'pending',
      index: true,
    },
    paymentMethod: {
      type: String,
      enum: ['cash', 'upi'],
    },
    arrivalDetails: {
      arrivedAt: { type: Date },
      distanceMeters: { type: Number },
      userLocation: {
        latitude: { type: Number },
        longitude: { type: Number },
      },
      vehiclePhoto: { type: String },
      damageReported: { type: Boolean, default: false },
      damageDescription: { type: String },
      damagePhotos: [{ type: String }],
    },
    verifiedAt: { type: Date },
    verifiedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    parkingStartTime: { type: Date },
    parkingEndTime: { type: Date },
    tenMinuteWarningSent: { type: Boolean, default: false, index: true },
    cancelReason: { type: String },
  },
  {
    timestamps: true,
    toJSON: {
      transform(_doc, ret: any) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

BookingSchema.index({ userId: 1, status: 1 });
BookingSchema.index({ ownerId: 1, status: 1 });
BookingSchema.index({ parkingId: 1, startTime: 1, endTime: 1 });

export const Booking = mongoose.model<IBooking>('Booking', BookingSchema);
