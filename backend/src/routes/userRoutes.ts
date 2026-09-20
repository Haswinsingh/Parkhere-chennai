import { Router } from 'express';
import { getProfile, updateProfile, changePassword } from '../controllers/userController';
import { authenticate } from '../middleware/auth';
import { uploadPublic } from '../middleware/upload';

const router = Router();

router.use(authenticate);

router.get('/me', getProfile);
router.patch('/me', uploadPublic.single('profileImage'), updateProfile);
router.post('/change-password', changePassword);

export default router;
