import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { login, logout, getMe, signup } from '../controllers/authController.js';
import { validate } from '../utils/validate.js';
import { loginSchema, signupSchema } from '../validators/authValidators.js';
import { requireAuth } from '../middleware/authMiddleware.js';

const router = Router();

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 30,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many authentication attempts. Please try again later.',
    code: 'RATE_LIMITED',
  },
});

router.post('/signup', authLimiter, validate({ body: signupSchema }), signup);
router.post('/login', authLimiter, validate({ body: loginSchema }), login);
router.post('/logout', requireAuth, logout);
router.get('/me', requireAuth, getMe);

export default router;
