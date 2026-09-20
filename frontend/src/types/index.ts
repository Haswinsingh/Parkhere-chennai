export type UserRole = 'parking_needed' | 'parking_holder' | 'admin';
export type VerificationStatus = 'pending' | 'approved' | 'rejected';
export type ParkingPref = 'Covered' | 'Open' | 'Any';
export type ParkingType = 'Covered' | 'Open' | 'Garage' | 'Basement';
export type SecurityPref = 'CCTV' | 'Gated Parking' | 'Both';
export type BookingStatus = 'upcoming' | 'arrived' | 'active' | 'completed' | 'cancelled';
export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'cancelled';
export type PaymentMethod = 'cash' | 'upi';

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  profileImage?: string;
  isActive: boolean;
  verificationStatus?: VerificationStatus;
  verificationNotes?: string;
  hostPreferences?: {
    numberOfVehicles?: number;
    parkingPreference?: ParkingPref;
    securityPreference?: SecurityPref;
  };
  idDocument?: {
    hasUploaded: boolean;
    originalName?: string;
    uploadedAt?: string;
  };
  landmark?: string;
  cctvAvailable?: boolean;
  gateAvailable?: boolean;
  photos?: string[];
  upiId?: string;
  settings?: {
    searchRadiusKm?: number;
    sortPreference?: 'distance' | 'price' | 'rating' | 'availability';
    notificationsEnabled?: boolean;
    theme?: 'light' | 'dark' | 'system';
  };
  createdAt: string;
  updatedAt: string;
}

export interface ParkingSpace {
  id: string;
  ownerId: string | { _id: string; id: string; name: string; phone: string; verificationStatus: VerificationStatus; upiId?: string };
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  totalSlots: number;
  availableSlots: number;
  pricePerHour: number;
  status: 'open' | 'closed';
  parkingType: 'Covered' | 'Open' | 'Garage' | 'Basement';
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
  createdAt: string;
  updatedAt: string;
}

export interface NearbyParkingItem {
  parking: ParkingSpace;
  distanceMeters: number;
}

export interface Booking {
  id: string;
  userId: string | { _id: string; id: string; name: string; phone: string; email: string };
  parkingId: string | ParkingSpace;
  ownerId: string | { _id: string; id: string; name: string; phone: string; upiId?: string };
  date: string;
  startTime: string;
  endTime: string;
  duration: number;
  pricePerHour: number;
  baseAmount: number;
  overtimeAmount: number;
  totalAmount: number;
  status: BookingStatus;
  paymentStatus: PaymentStatus;
  paymentMethod?: PaymentMethod;
  arrivalDetails?: {
    arrivedAt: string;
    distanceMeters: number;
    userLocation: { latitude: number; longitude: number };
    vehiclePhoto: string;
    damageReported: boolean;
    damageDescription?: string;
    damagePhotos?: string[];
  };
  verifiedAt?: string;
  parkingStartTime?: string;
  parkingEndTime?: string;
  tenMinuteWarningSent: boolean;
  cancelReason?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PaymentRecord {
  id: string;
  bookingId: string;
  userId: string;
  ownerId: string;
  amount: number;
  method: PaymentMethod;
  status: PaymentStatus;
  transactionReference: string;
  upiDetails?: {
    payeeUpiId: string;
    payeeName: string;
    transactionNote: string;
    upiUri: string;
  };
  paidAt?: string;
  createdAt: string;
}

export interface NotificationItem {
  id: string;
  userId: string;
  type: string;
  title: string;
  message: string;
  bookingId?: string;
  read: boolean;
  createdAt: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  code?: string;
}
