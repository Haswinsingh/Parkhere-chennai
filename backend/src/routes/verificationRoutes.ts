import { Router } from 'express';
import {
  getHostVerificationStatus,
  updateHostVerification,
  resubmitHostVerification,
  verifyCurrentHost,
} from '../controllers/verificationController';
import { authenticate } from '../middleware/auth';
import { requireRole } from '../middleware/role';
import { uploadPrivate } from '../middleware/upload';

const router = Router();

router.use(authenticate);

// Host views their verification status
router.get('/status', getHostVerificationStatus);

// Host self-verifies their documents / 1-click verification
router.post('/verify-me', requireRole('parking_holder', 'admin'), verifyCurrentHost);

// Host resubmits verification documents
router.post(
  '/resubmit',
  requireRole('parking_holder'),
  uploadPrivate.fields([
    { name: 'idDocument', maxCount: 1 },
    { name: 'photos', maxCount: 6 },
  ]),
  resubmitHostVerification
);

// Admin approves or rejects host
router.post('/review', updateHostVerification);

export default router;
