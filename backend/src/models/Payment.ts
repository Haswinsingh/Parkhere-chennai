import mongoose, { Document, Schema } from 'mongoose';

export type PaymentMode = 'cash' | 'upi';
export type PaymentState = 'pending' | 'paid' | 'failed' | 'cancelled';

export interface IPayment extends Document {
  bookingId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  ownerId: mongoose.Types.ObjectId;
  amount: number;
  method: PaymentMode;
  status: PaymentState;
  transactionReference: string;
  upiDetails?: {
    payeeUpiId: string;
    payeeName: string;
    transactionNote: string;
    upiUri: string;
  };
  cashConfirmedBy?: mongoose.Types.ObjectId;
  paidAt?: Date;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const PaymentSchema = new Schema<IPayment>(
  {
    bookingId: { type: Schema.Types.ObjectId, ref: 'Booking', required: true, index: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    ownerId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    amount: { type: Number, required: true, min: 0 },
    method: { type: String, enum: ['cash', 'upi'], required: true },
    status: {
      type: String,
      enum: ['pending', 'paid', 'failed', 'cancelled'],
      default: 'pending',
      index: true,
    },
    transactionReference: { type: String, required: true, unique: true, index: true },
    upiDetails: {
      payeeUpiId: { type: String },
      payeeName: { type: String },
      transactionNote: { type: String },
      upiUri: { type: String },
    },
    cashConfirmedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    paidAt: { type: Date },
    notes: { type: String },
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

export const Payment = mongoose.model<IPayment>('Payment', PaymentSchema);
