import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';
import { Booking } from '../models/Booking';
import { Payment } from '../models/Payment';
import { ParkingSpace } from '../models/ParkingSpace';
import { User } from '../models/User';
import { generateDynamicUpiPayment } from '../services/upiService';
import { sendNotification } from '../services/notificationService';

export const createPayment = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const { bookingId, method } = req.body;
    const user = req.user!;

    if (!bookingId || !method || !['cash', 'upi'].includes(method)) {
      res.status(400).json({
        success: false,
        message: "Please provide a valid bookingId and method ('cash' or 'upi').",
      });
      return;
    }

    const booking = await Booking.findById(bookingId).populate('parkingId', 'name');
    if (!booking) {
      res.status(404).json({
        success: false,
        message: 'Booking not found.',
      });
      return;
    }

    if (booking.userId.toString() !== user._id.toString() && user.role !== 'admin') {
      res.status(403).json({
        success: false,
        message: 'You are not authorized to make a payment for this booking.',
      });
      return;
    }

    if (booking.paymentStatus === 'paid') {
      res.status(400).json({
        success: false,
        message: 'This booking has already been paid.',
      });
      return;
    }

    // Overtime calculation if current time exceeds booked end time
    const now = new Date();
    let overtimeAmount = 0;
    if (booking.parkingEndTime && now > booking.parkingEndTime) {
      const extraMs = now.getTime() - booking.parkingEndTime.getTime();
      const extraHours = Math.ceil(extraMs / (3600 * 1000));
      overtimeAmount = extraHours * booking.pricePerHour;
    }

    const finalAmount = booking.baseAmount + overtimeAmount;
    booking.overtimeAmount = overtimeAmount;
    booking.totalAmount = finalAmount;
    booking.paymentMethod = method;
    await booking.save();

    const transactionReference = `PH-${Date.now().toString(36).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`;

    const owner = await User.findById(booking.ownerId);
    const payeeUpiId = owner?.upiId || 'parkhere@upi';
    const payeeName = owner?.name || 'ParkHere Host';

    let upiDetails: any = undefined;
    let qrCodeDataUrl: string | undefined = undefined;

    if (method === 'upi') {
      const dynamicUpi = await generateDynamicUpiPayment({
        payeeUpiId,
        payeeName,
        amount: finalAmount,
        transactionReference,
        transactionNote: `ParkHere Booking ${(booking.parkingId as any).name}`,
      });

      upiDetails = {
        payeeUpiId,
        payeeName,
        transactionNote: `ParkHere Booking ${(booking.parkingId as any).name}`,
        upiUri: dynamicUpi.upiUri,
      };
      qrCodeDataUrl = dynamicUpi.qrCodeDataUrl;
    }

    // Upsert or create Payment
    let payment = await Payment.findOne({ bookingId: booking._id });
    if (payment) {
      payment.method = method;
      payment.amount = finalAmount;
      payment.transactionReference = transactionReference;
      payment.upiDetails = upiDetails;
      payment.status = 'pending';
      await payment.save();
    } else {
      payment = await Payment.create({
        bookingId: booking._id,
        userId: user._id,
        ownerId: booking.ownerId,
        amount: finalAmount,
        method,
        status: 'pending',
        transactionReference,
        upiDetails,
      });
    }

    // If cash payment selected, notify the host
    if (method === 'cash') {
      await sendNotification({
        userId: booking.ownerId,
        type: 'payment_pending',
        title: 'Cash Payment Expected',
        message: `${user.name} selected cash payment of ₹${finalAmount} for booking at ${(booking.parkingId as any).name}. Please collect and confirm receipt.`,
        bookingId: booking._id,
      });
    }

    res.status(201).json({
      success: true,
      message: method === 'cash' ? 'Cash payment request created.' : 'Dynamic UPI payment request generated.',
      data: {
        payment,
        qrCodeDataUrl,
        breakdown: {
          baseAmount: booking.baseAmount,
          overtimeAmount: booking.overtimeAmount,
          finalAmount: booking.totalAmount,
          duration: booking.duration,
          pricePerHour: booking.pricePerHour,
        },
      },
    });
  } catch (err: any) {
    console.error('Error creating payment:', err);
    res.status(500).json({
      success: false,
      message: err.message || 'Failed to initiate payment.',
    });
  }
};

export const confirmPayment = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const { paymentId, bookingId, method, upiTransactionRef } = req.body;
    const user = req.user!;

    let payment = paymentId
      ? await Payment.findById(paymentId)
      : await Payment.findOne({ bookingId });

    if (!payment) {
      res.status(404).json({
        success: false,
        message: 'Payment record not found.',
      });
      return;
    }

    const booking = await Booking.findById(payment.bookingId);
    if (!booking) {
      res.status(404).json({
        success: false,
        message: 'Booking not found.',
      });
      return;
    }

    if (payment.method === 'cash') {
      // Security Rule: ONLY the parking holder or admin can confirm Cash Received!
      if (booking.ownerId.toString() !== user._id.toString() && user.role !== 'admin') {
        res.status(403).json({
          success: false,
          message: 'Only the parking holder can confirm cash receipt.',
        });
        return;
      }

      payment.status = 'paid';
      payment.paidAt = new Date();
      payment.cashConfirmedBy = user._id;
      await payment.save();

      booking.paymentStatus = 'paid';
      booking.status = 'completed';
      await booking.save();

      // Free up slot back into parking space
      await ParkingSpace.findByIdAndUpdate(booking.parkingId, {
        $inc: { availableSlots: 1 },
      });

      await sendNotification({
        userId: booking.userId,
        type: 'payment_received',
        title: 'Cash Payment Confirmed',
        message: `Host confirmed cash payment of ₹${payment.amount}. Your parking session is completed. Thank you!`,
        bookingId: booking._id,
      });

      res.status(200).json({
        success: true,
        message: 'Cash payment confirmed and session closed.',
        data: {
          payment,
          booking,
        },
      });
      return;
    }

    if (payment.method === 'upi') {
      // Driver confirms UPI payment transfer with transaction reference
      if (booking.userId.toString() !== user._id.toString() && user.role !== 'admin') {
        res.status(403).json({
          success: false,
          message: 'You are not authorized to confirm this UPI payment.',
        });
        return;
      }

      payment.status = 'paid';
      payment.paidAt = new Date();
      if (upiTransactionRef) {
        payment.notes = `UPI Reference: ${upiTransactionRef}`;
      }
      await payment.save();

      booking.paymentStatus = 'paid';
      booking.status = 'completed';
      await booking.save();

      // Free up slot
      await ParkingSpace.findByIdAndUpdate(booking.parkingId, {
        $inc: { availableSlots: 1 },
      });

      await sendNotification({
        userId: booking.ownerId,
        type: 'payment_received',
        title: 'UPI Payment Received',
        message: `UPI payment of ₹${payment.amount} received for booking ${booking._id}.`,
        bookingId: booking._id,
      });

      await sendNotification({
        userId: booking.userId,
        type: 'payment_received',
        title: 'Payment Successful',
        message: `Payment of ₹${payment.amount} successful! Your parking session is completed.`,
        bookingId: booking._id,
      });

      res.status(200).json({
        success: true,
        message: 'Payment confirmed successfully.',
        data: {
          payment,
          booking,
        },
      });
      return;
    }

    res.status(400).json({
      success: false,
      message: 'Unsupported payment confirmation mode.',
    });
  } catch (err: any) {
    console.error('Error confirming payment:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to confirm payment.',
    });
  }
};

export const getPaymentByBookingId = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const { bookingId } = req.params;
    const payment = await Payment.findOne({ bookingId });

    if (!payment) {
      res.status(404).json({
        success: false,
        message: 'No payment record found for this booking.',
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: {
        payment,
      },
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve payment details.',
    });
  }
};
