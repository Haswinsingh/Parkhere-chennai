"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const bookingController_1 = require("../controllers/bookingController");
const arrivalController_1 = require("../controllers/arrivalController");
const auth_1 = require("../middleware/auth");
const upload_1 = require("../middleware/upload");
const router = (0, express_1.Router)();
router.use(auth_1.authenticate);
// Driver books a parking space
router.post('/', bookingController_1.createBooking);
// List user's bookings (Driver or Host)
router.get('/', bookingController_1.getBookings);
// Get specific booking details
router.get('/:id', bookingController_1.getBookingById);
// Cancel booking
router.patch('/:id/cancel', bookingController_1.cancelBooking);
// Arrival Geofence verification & Vehicle Photo upload
router.post('/:id/arrival', upload_1.uploadPrivate.fields([
    { name: 'vehiclePhoto', maxCount: 1 },
    { name: 'damagePhotos', maxCount: 5 },
]), arrivalController_1.submitArrival);
// Host arrival verification (Approve / Reject)
router.post('/:id/verify-arrival', arrivalController_1.verifyArrival);
exports.default = router;
