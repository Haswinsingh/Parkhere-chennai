import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';
import { Booking } from '../models/Booking';
import { ParkingSpace } from '../models/ParkingSpace';
import { sendNotification } from '../services/notificationService';

export const createBooking = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const user = req.user!;

    if (user.role !== 'parking_needed' && user.role !== 'admin') {
      res.status(403).json({
        success: false,
        message: 'Only registered drivers can book parking spaces.',
      });
      return;
    }

    const { parkingId, date, startTime, duration } = req.body;

    if (!parkingId || !date || !startTime || !duration) {
      res.status(400).json({
        success: false,
        message: 'Please provide parkingId, date, startTime, and duration.',
      });
      return;
    }

    const parsedDuration = parseFloat(duration);
    if (isNaN(parsedDuration) || parsedDuration <= 0) {
      res.status(400).json({
        success: false,
        message: 'Duration must be a positive number of hours.',
      });
      return;
    }

    const startDateTime = new Date(startTime);
    if (isNaN(startDateTime.getTime())) {
      res.status(400).json({
        success: false,
        message: 'Invalid start time format.',
      });
      return;
    }

    const endDateTime = new Date(startDateTime.getTime() + parsedDuration * 3600 * 1000);

    // Atomic slot verification and reservation to prevent race conditions and overbooking
    const parkingSpace = await ParkingSpace.findOneAndUpdate(
      {
        _id: parkingId,
        status: 'open',
        availableSlots: { $gt: 0 },
      },
      {
        $inc: { availableSlots: -1 },
      },
      { new: true }
    );

    if (!parkingSpace) {
      res.status(409).json({
        success: false,
        message: 'This slot is no longer available or parking space is closed.',
        code: 'SLOT_UNAVAILABLE',
      });
      return;
    }

    // Calculate billing purely server-side
    const baseAmount = Math.round(parkingSpace.pricePerHour * parsedDuration);
    const totalAmount = baseAmount;

    const newBooking = await Booking.create({
      userId: user._id,
      parkingId: parkingSpace._id,
      ownerId: parkingSpace.ownerId,
      date,
      startTime: startDateTime,
      endTime: endDateTime,
      duration: parsedDuration,
      pricePerHour: parkingSpace.pricePerHour,
      baseAmount,
      overtimeAmount: 0,
      totalAmount,
      status: 'upcoming',
      paymentStatus: 'pending',
      tenMinuteWarningSent: false,
    });

    // Send notifications to both driver and host
    await sendNotification({
      userId: user._id,
      type: 'booking_confirmed',
      title: 'Booking Confirmed',
      message: `Your booking at ${parkingSpace.name} for ${parsedDuration}h has been confirmed. Total: ₹${totalAmount}.`,
      bookingId: newBooking._id,
    });

    await sendNotification({
      userId: parkingSpace.ownerId,
      type: 'booking_confirmed',
      title: 'New Booking Received',
      message: `${user.name} booked a slot at ${parkingSpace.name} for ${parsedDuration}h (${date}).`,
      bookingId: newBooking._id,
    });

    res.status(201).json({
      success: true,
      message: 'Parking booking created successfully.',
      data: {
        booking: newBooking,
      },
    });
  } catch (err: any) {
    console.error('Error creating booking:', err);
    res.status(500).json({
      success: false,
      message: err.message || 'Failed to create booking.',
    });
  }
};

export const getBookings = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const user = req.user!;
    const { status } = req.query;

    const query: any = {};

    if (user.role === 'parking_needed') {
      query.userId = user._id;
    } else if (user.role === 'parking_holder') {
      query.ownerId = user._id;
    }

    if (status) {
      query.status = status;
    }

    const bookings = await Booking.find(query)
      .populate('parkingId', 'name address photos landmark latitude longitude')
      .populate('userId', 'name phone email')
      .populate('ownerId', 'name phone upiId')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: {
        bookings,
      },
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve bookings.',
    });
  }
};

export const getBookingById = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const user = req.user!;

    const booking = await Booking.findById(id)
      .populate('parkingId', 'name address photos landmark latitude longitude pricePerHour')
      .populate('userId', 'name phone email')
      .populate('ownerId', 'name phone upiId');

    if (!booking) {
      res.status(404).json({
        success: false,
        message: 'Booking not found.',
      });
      return;
    }

    const isDriver = booking.userId._id.toString() === user._id.toString();
    const isOwner = booking.ownerId._id.toString() === user._id.toString();

    if (!isDriver && !isOwner && user.role !== 'admin') {
      res.status(403).json({
        success: false,
        message: 'You are not authorized to view this booking.',
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: {
        booking,
      },
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve booking details.',
    });
  }
};

export const cancelBooking = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const user = req.user!;
    const { reason } = req.body;

    const booking = await Booking.findById(id);

    if (!booking) {
      res.status(404).json({
        success: false,
        message: 'Booking not found.',
      });
      return;
    }

    const isDriver = booking.userId.toString() === user._id.toString();
    const isOwner = booking.ownerId.toString() === user._id.toString();

    if (!isDriver && !isOwner && user.role !== 'admin') {
      res.status(403).json({
        success: false,
        message: 'You are not authorized to cancel this booking.',
      });
      return;
    }

    if (booking.status === 'active' || booking.status === 'completed') {
      res.status(400).json({
        success: false,
        message: `Cannot cancel a booking that is currently ${booking.status}.`,
      });
      return;
    }

    if (booking.status === 'cancelled') {
      res.status(400).json({
        success: false,
        message: 'This booking is already cancelled.',
      });
      return;
    }

    booking.status = 'cancelled';
    booking.cancelReason = reason || 'Cancelled by user';
    await booking.save();

    // Release the reserved slot back to the parking space
    await ParkingSpace.findByIdAndUpdate(booking.parkingId, {
      $inc: { availableSlots: 1 },
    });

    // Notify parties
    await sendNotification({
      userId: booking.userId,
      type: 'booking_cancelled',
      title: 'Booking Cancelled',
      message: `Your booking has been cancelled.`,
      bookingId: booking._id,
    });

    await sendNotification({
      userId: booking.ownerId,
      type: 'booking_cancelled',
      title: 'Booking Cancelled',
      message: `Booking has been cancelled and the slot has been restored.`,
      bookingId: booking._id,
    });

    res.status(200).json({
      success: true,
      message: 'Booking cancelled successfully.',
      data: {
        booking,
      },
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      message: err.message || 'Failed to cancel booking.',
    });
  }
};
