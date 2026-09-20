import { Router } from 'express';
import {
  createPayment,
  confirmPayment,
  getPaymentByBookingId,
} from '../controllers/paymentController';
import { authenticate } from '../middleware/auth';

const router = Router();

router.use(authenticate);

router.post('/create', createPayment);
router.post('/confirm', confirmPayment);
router.get('/booking/:bookingId', getPaymentByBookingId);

export default router;
