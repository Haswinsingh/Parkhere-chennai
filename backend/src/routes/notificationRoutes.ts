import { Router } from 'express';
import {
  getMyNotifications,
  markNotificationAsRead,
  markAllAsRead,
} from '../controllers/notificationController';
import { authenticate } from '../middleware/auth';

const router = Router();

router.use(authenticate);

router.get('/', getMyNotifications);
router.patch('/:id/read', markNotificationAsRead);
router.post('/mark-all-read', markAllAsRead);

export default router;
