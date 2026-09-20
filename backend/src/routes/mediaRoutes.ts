import { Router } from 'express';
import { getPublicMedia, getPrivateMedia } from '../controllers/mediaController';
import { authenticate } from '../middleware/auth';

const router = Router();

// Public media (parking photos, profile avatars)
router.get('/public/:filename', getPublicMedia);

// Private media (protected ID documents, vehicle photos, damage inspection photos)
router.get('/private/:filename', authenticate, getPrivateMedia);

export default router;
