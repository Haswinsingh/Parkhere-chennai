"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cancelBooking = exports.getBookingById = exports.getBookings = exports.createBooking = void 0;
const Booking_1 = require("../models/Booking");
const ParkingSpace_1 = require("../models/ParkingSpace");
const notificationService_1 = require("../services/notificationService");
const createBooking = async (req, res) => {
    try {
        const user = req.user;
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
        const parkingSpace = await ParkingSpace_1.ParkingSpace.findOneAndUpdate({
            _id: parkingId,
            status: 'open',
            availableSlots: { $gt: 0 },
        }, {
            $inc: { availableSlots: -1 },
        }, { new: true });
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
        const newBooking = await Booking_1.Booking.create({
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
        await (0, notificationService_1.sendNotification)({
            userId: user._id,
            type: 'booking_confirmed',
            title: 'Booking Confirmed',
            message: `Your booking at ${parkingSpace.name} for ${parsedDuration}h has been confirmed. Total: ₹${totalAmount}.`,
            bookingId: newBooking._id,
        });
        await (0, notificationService_1.sendNotification)({
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
    }
    catch (err) {
        console.error('Error creating booking:', err);
        res.status(500).json({
            success: false,
            message: err.message || 'Failed to create booking.',
        });
    }
};
exports.createBooking = createBooking;
const getBookings = async (req, res) => {
    try {
        const user = req.user;
        const { status } = req.query;
        const query = {};
        if (user.role === 'parking_needed') {
            query.userId = user._id;
        }
        else if (user.role === 'parking_holder') {
            query.ownerId = user._id;
        }
        if (status) {
            query.status = status;
        }
        const bookings = await Booking_1.Booking.find(query)
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
    }
    catch (err) {
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve bookings.',
        });
    }
};
exports.getBookings = getBookings;
const getBookingById = async (req, res) => {
    try {
        const { id } = req.params;
        const user = req.user;
        const booking = await Booking_1.Booking.findById(id)
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
    }
    catch (err) {
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve booking details.',
        });
    }
};
exports.getBookingById = getBookingById;
const cancelBooking = async (req, res) => {
    try {
        const { id } = req.params;
        const user = req.user;
        const { reason } = req.body;
        const booking = await Booking_1.Booking.findById(id);
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
        await ParkingSpace_1.ParkingSpace.findByIdAndUpdate(booking.parkingId, {
            $inc: { availableSlots: 1 },
        });
        // Notify parties
        await (0, notificationService_1.sendNotification)({
            userId: booking.userId,
            type: 'booking_cancelled',
            title: 'Booking Cancelled',
            message: `Your booking has been cancelled.`,
            bookingId: booking._id,
        });
        await (0, notificationService_1.sendNotification)({
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
    }
    catch (err) {
        res.status(500).json({
            success: false,
            message: err.message || 'Failed to cancel booking.',
        });
    }
};
exports.cancelBooking = cancelBooking;
