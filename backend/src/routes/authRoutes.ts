import { Router } from 'express';
import { register, login, getMe, logout } from '../controllers/authController';
import { authenticate } from '../middleware/auth';
import { uploadPrivate } from '../middleware/upload';

const router = Router();

// Parking Holder registration may include idDocument and parking photos
router.post(
  '/register',
  uploadPrivate.fields([
    { name: 'idDocument', maxCount: 1 },
    { name: 'photos', maxCount: 6 },
  ]),
  register
);

router.post('/login', login);
router.get('/me', authenticate, getMe);
router.post('/logout', logout);

export default router;
