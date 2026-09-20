"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyArrival = exports.submitArrival = void 0;
const Booking_1 = require("../models/Booking");
const ParkingSpace_1 = require("../models/ParkingSpace");
const distance_1 = require("../utils/distance");
const notificationService_1 = require("../services/notificationService");
const env_1 = require("../config/env");
const submitArrival = async (req, res) => {
    try {
        const { id } = req.params;
        const user = req.user;
        const booking = await Booking_1.Booking.findById(id);
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
                message: 'You are not authorized to check in for this booking.',
            });
            return;
        }
        if (booking.status === 'active' || booking.status === 'completed') {
            res.status(400).json({
                success: false,
                message: `Booking is already ${booking.status}.`,
            });
            return;
        }
        const { latitude, longitude, damageReported, damageDescription } = req.body;
        if (latitude === undefined || longitude === undefined) {
            res.status(400).json({
                success: false,
                message: 'Current GPS coordinates are required for arrival verification.',
            });
            return;
        }
        const userLat = parseFloat(latitude);
        const userLng = parseFloat(longitude);
        if (isNaN(userLat) || isNaN(userLng)) {
            res.status(400).json({
                success: false,
                message: 'Invalid GPS coordinates.',
            });
            return;
        }
        // Retrieve parking space location
        const parking = await ParkingSpace_1.ParkingSpace.findById(booking.parkingId);
        if (!parking) {
            res.status(404).json({
                success: false,
                message: 'Parking space not found.',
            });
            return;
        }
        // Server-side Geofence Verification (100 meters)
        const distanceMeters = (0, distance_1.calculateDistanceMeters)(userLat, userLng, parking.latitude, parking.longitude);
        const allowedRadius = env_1.ENV.ARRIVAL_RADIUS_METERS; // 100 meters default
        if (distanceMeters > allowedRadius) {
            res.status(400).json({
                success: false,
                message: `You appear to be away from the parking location. You must be within ${allowedRadius}m of the parking entrance (Detected distance: ${(0, distance_1.formatDistance)(distanceMeters)}).`,
                code: 'GEOFENCE_CHECK_FAILED',
                data: {
                    detectedDistanceMeters: distanceMeters,
                    allowedRadiusMeters: allowedRadius,
                },
            });
            return;
        }
        // Vehicle photo is compulsory
        const files = req.files;
        const vehiclePhotoFile = files?.['vehiclePhoto']?.[0];
        if (!vehiclePhotoFile && !req.body.vehiclePhoto) {
            res.status(400).json({
                success: false,
                message: 'A vehicle photo is compulsory for arrival verification.',
            });
            return;
        }
        const vehiclePhotoPath = vehiclePhotoFile ? vehiclePhotoFile.filename : req.body.vehiclePhoto;
        // Damage documentation
        const hasDamage = damageReported === 'true' || damageReported === true;
        const damagePhotoFiles = files?.['damagePhotos'] || [];
        const damagePhotos = damagePhotoFiles.map((f) => f.filename);
        if (hasDamage && !damageDescription && damagePhotos.length === 0) {
            res.status(400).json({
                success: false,
                message: 'Please provide a damage description or photo when reporting pre-existing damage.',
            });
            return;
        }
        // Update booking arrival details
        booking.arrivalDetails = {
            arrivedAt: new Date(),
            distanceMeters,
            userLocation: {
                latitude: userLat,
                longitude: userLng,
            },
            vehiclePhoto: vehiclePhotoPath,
            damageReported: hasDamage,
            damageDescription: hasDamage ? damageDescription : undefined,
            damagePhotos: hasDamage ? damagePhotos : [],
        };
        booking.status = 'arrived';
        await booking.save();
        // Notify the parking holder
        await (0, notificationService_1.sendNotification)({
            userId: booking.ownerId,
            type: 'arrival_required',
            title: 'Vehicle Arrival Verification Needed',
            message: `${user.name} has arrived at ${parking.name} (${(0, distance_1.formatDistance)(distanceMeters)} away). Please inspect the vehicle photos and approve arrival.`,
            bookingId: booking._id,
        });
        res.status(200).json({
            success: true,
            message: 'Arrival verified successfully. Awaiting host confirmation.',
            data: {
                booking,
                distanceMeters,
            },
        });
    }
    catch (err) {
        console.error('Error submitting arrival:', err);
        res.status(500).json({
            success: false,
            message: err.message || 'Failed to submit arrival verification.',
        });
    }
};
exports.submitArrival = submitArrival;
const verifyArrival = async (req, res) => {
    try {
        const { id } = req.params;
        const user = req.user;
        const { action, rejectionReason } = req.body; // 'approve' or 'reject'
        const booking = await Booking_1.Booking.findById(id).populate('parkingId', 'name');
        if (!booking) {
            res.status(404).json({
                success: false,
                message: 'Booking not found.',
            });
            return;
        }
        if (booking.ownerId.toString() !== user._id.toString() && user.role !== 'admin') {
            res.status(403).json({
                success: false,
                message: 'Only the parking holder who owns this space can verify arrival.',
            });
            return;
        }
        if (booking.status !== 'arrived') {
            res.status(400).json({
                success: false,
                message: `Cannot verify arrival for a booking with status '${booking.status}'.`,
            });
            return;
        }
        if (action === 'approve') {
            const now = new Date();
            booking.status = 'active';
            booking.verifiedAt = now;
            booking.verifiedBy = user._id;
            booking.parkingStartTime = now;
            // End time is determined from actual start time + booked duration
            booking.parkingEndTime = new Date(now.getTime() + booking.duration * 3600 * 1000);
            booking.endTime = booking.parkingEndTime;
            await booking.save();
            await (0, notificationService_1.sendNotification)({
                userId: booking.userId,
                type: 'arrival_approved',
                title: 'Arrival Approved — Session Active',
                message: `Your arrival at ${booking.parkingId.name} has been approved by the host. Your parking timer has started!`,
                bookingId: booking._id,
            });
            res.status(200).json({
                success: true,
                message: 'Arrival approved and parking session started.',
                data: {
                    booking,
                },
            });
        }
        else if (action === 'reject') {
            booking.status = 'upcoming'; // Reset back to upcoming so driver can re-verify or cancel
            await booking.save();
            await (0, notificationService_1.sendNotification)({
                userId: booking.userId,
                type: 'arrival_rejected',
                title: 'Arrival Verification Rejected',
                message: `The host could not verify your arrival: ${rejectionReason || 'Please verify vehicle photo and location.'}`,
                bookingId: booking._id,
            });
            res.status(200).json({
                success: true,
                message: 'Arrival submission rejected.',
                data: {
                    booking,
                },
            });
        }
        else {
            res.status(400).json({
                success: false,
                message: "Invalid action. Expected 'approve' or 'reject'.",
            });
        }
    }
    catch (err) {
        console.error('Error verifying arrival:', err);
        res.status(500).json({
            success: false,
            message: err.message || 'Failed to process arrival verification.',
        });
    }
};
exports.verifyArrival = verifyArrival;
