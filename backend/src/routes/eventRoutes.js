import { Router } from 'express';
import {
  createEvent,
  deleteEvent,
  getEvent,
  listEvents,
  listManagedEvents,
  updateEvent,
} from '../controllers/eventController.js';
import { requireAuth } from '../middleware/authMiddleware.js';
import { authorize } from '../middleware/roleMiddleware.js';
import { validate } from '../utils/validate.js';
import {
  createEventSchema,
  eventParamsSchema,
  listEventsQuerySchema,
  updateEventSchema,
} from '../validators/eventValidators.js';
import {
  eventParamsSchema as registrationEventParamsSchema,
  registrationSearchQuerySchema,
} from '../validators/registrationValidators.js';
import { listEventRegistrations } from '../controllers/registrationController.js';

const router = Router();

router.get('/', validate({ query: listEventsQuerySchema }), listEvents);
router.get('/manage', requireAuth, authorize('organizer'), validate({ query: listEventsQuerySchema }), listManagedEvents);
router.post('/', requireAuth, authorize('organizer'), validate({ body: createEventSchema }), createEvent);
router.get(
  '/:id/registrations',
  requireAuth,
  authorize('organizer'),
  validate({
    params: registrationEventParamsSchema,
    query: registrationSearchQuerySchema,
  }),
  listEventRegistrations,
);
router.get('/:id', validate({ params: eventParamsSchema }), getEvent);
router.put(
  '/:id',
  requireAuth,
  authorize('organizer'),
  validate({ params: eventParamsSchema, body: updateEventSchema }),
  updateEvent,
);
router.delete(
  '/:id',
  requireAuth,
  authorize('organizer'),
  validate({ params: eventParamsSchema }),
  deleteEvent,
);

export default router;
