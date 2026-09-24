import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import {
  createRegistration,
  getRegistration,
  getTicket,
  listRegistrations,
} from '../controllers/registrationController.js';
import { requireAuth } from '../middleware/authMiddleware.js';
import { authorize } from '../middleware/roleMiddleware.js';
import { validate } from '../utils/validate.js';
import {
  createRegistrationSchema,
  listRegistrationsQuerySchema,
  registrationParamsSchema,
  ticketParamsSchema,
} from '../validators/registrationValidators.js';

const router = Router();
const registrationLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 120,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: {
    success: false,
    code: 'RATE_LIMITED',
    message: 'Too many registration attempts. Please try again later.',
  },
});

router.post('/', registrationLimiter, validate({ body: createRegistrationSchema }), createRegistration);
router.get(
  '/',
  requireAuth,
  authorize('organizer'),
  validate({ query: listRegistrationsQuerySchema }),
  listRegistrations,
);
router.get('/ticket/:ticketId', validate({ params: ticketParamsSchema }), getTicket);
router.get(
  '/:id',
  requireAuth,
  authorize('organizer'),
  validate({ params: registrationParamsSchema }),
  getRegistration,
);

export default router;
