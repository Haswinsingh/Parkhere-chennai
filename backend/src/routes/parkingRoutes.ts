import { Router } from 'express';
import {
  createParkingSpace,
  getMyParkingSpaces,
  getParkingSpaceById,
  updateParkingSpace,
  deleteParkingSpace,
  getNearbyParkingSpaces,
} from '../controllers/parkingController';
import { authenticate } from '../middleware/auth';
import { uploadPublic } from '../middleware/upload';

const router = Router();

// Nearby parking search (public or authenticated)
router.get('/nearby', getNearbyParkingSpaces);

// Owner parking spaces
router.get('/my-spaces', authenticate, getMyParkingSpaces);

// Single parking space details
router.get('/:id', getParkingSpaceById);

// Create parking space (Parking Holder only)
router.post(
  '/',
  authenticate,
  uploadPublic.array('photos', 6),
  createParkingSpace
);

// Update parking space (Owner only)
router.patch(
  '/:id',
  authenticate,
  uploadPublic.array('photos', 6),
  updateParkingSpace
);

// Delete parking space (Owner only)
router.delete('/:id', authenticate, deleteParkingSpace);

export default router;
