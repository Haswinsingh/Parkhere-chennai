import { Router } from 'express';
import {
  createBooking,
  getBookings,
  getBookingById,
  cancelBooking,
} from '../controllers/bookingController';
import { submitArrival, verifyArrival } from '../controllers/arrivalController';
import { authenticate } from '../middleware/auth';
import { uploadPrivate } from '../middleware/upload';

const router = Router();

router.use(authenticate);

// Driver books a parking space
router.post('/', createBooking);

// List user's bookings (Driver or Host)
router.get('/', getBookings);

// Get specific booking details
router.get('/:id', getBookingById);

// Cancel booking
router.patch('/:id/cancel', cancelBooking);

// Arrival Geofence verification & Vehicle Photo upload
router.post(
  '/:id/arrival',
  uploadPrivate.fields([
    { name: 'vehiclePhoto', maxCount: 1 },
    { name: 'damagePhotos', maxCount: 5 },
  ]),
  submitArrival
);

// Host arrival verification (Approve / Reject)
router.post('/:id/verify-arrival', verifyArrival);

export default router;
