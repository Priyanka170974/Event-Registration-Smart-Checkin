import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { scanTicket, verifyTicket } from '../controllers/checkInController.js';
import { requireAuth } from '../middleware/authMiddleware.js';
import { authorize } from '../middleware/roleMiddleware.js';
import { validate } from '../utils/validate.js';
import { checkInSchema } from '../validators/checkInValidators.js';

const router = Router();
const checkInLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 240,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: {
    success: false,
    code: 'RATE_LIMITED',
    message: 'Too many check-in attempts. Please pause and try again shortly.',
  },
});

router.post(
  '/verify',
  checkInLimiter,
  requireAuth,
  authorize('volunteer'),
  validate({ body: checkInSchema }),
  verifyTicket,
);
router.post(
  '/scan',
  checkInLimiter,
  requireAuth,
  authorize('volunteer'),
  validate({ body: checkInSchema }),
  scanTicket,
);

export default router;
