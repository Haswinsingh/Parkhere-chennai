import mongoose, { Document, Schema } from 'mongoose';

export type ParkingStatus = 'open' | 'closed';
export type ParkingType = 'Covered' | 'Open' | 'Garage' | 'Basement';

export interface IParkingSpace extends Document {
  ownerId: mongoose.Types.ObjectId;
  name: string;
  address: string;
  location: {
    type: 'Point';
    coordinates: [number, number]; // [longitude, latitude] per GeoJSON standard
  };
  latitude: number;
  longitude: number;
  totalSlots: number;
  availableSlots: number;
  pricePerHour: number;
  status: ParkingStatus;
  parkingType: ParkingType;
  landmark: string;
  cctvAvailable: boolean;
  gateAvailable: boolean;
  amenities: string[];
  photos: string[];
  openingTime: string;
  closingTime: string;
  verified: boolean;
  rating: number;
  reviewCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const ParkingSpaceSchema = new Schema<IParkingSpace>(
  {
    ownerId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    name: { type: String, required: true, trim: true },
    address: { type: String, required: true, trim: true },
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
        required: true,
      },
      coordinates: {
        type: [Number], // [lng, lat]
        required: true,
      },
    },
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true },
    totalSlots: { type: Number, required: true, min: 1 },
    availableSlots: { type: Number, required: true, min: 0 },
    pricePerHour: { type: Number, required: true, min: 0 },
    status: { type: String, enum: ['open', 'closed'], default: 'open', index: true },
    parkingType: {
      type: String,
      enum: ['Covered', 'Open', 'Garage', 'Basement'],
      default: 'Open',
    },
    landmark: { type: String, required: true, trim: true },
    cctvAvailable: { type: Boolean, default: false },
    gateAvailable: { type: Boolean, default: false },
    amenities: [{ type: String }],
    photos: {
      type: [String],
      validate: {
        validator: function (val: string[]) {
          return val.length >= 2;
        },
        message: 'A minimum of 2 parking photos is required.',
      },
    },
    openingTime: { type: String, default: '00:00' },
    closingTime: { type: String, default: '23:59' },
    verified: { type: Boolean, default: false, index: true },
    rating: { type: Number, default: 4.8 },
    reviewCount: { type: Number, default: 0 },
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

// 2dsphere index for true native geospatial distance queries
ParkingSpaceSchema.index({ location: '2dsphere' });
ParkingSpaceSchema.index({ ownerId: 1, status: 1 });

export const ParkingSpace = mongoose.model<IParkingSpace>('ParkingSpace', ParkingSpaceSchema);
