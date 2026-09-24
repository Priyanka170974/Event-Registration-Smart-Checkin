import { z } from 'zod';
import { objectId } from './eventValidators.js';
import { parseTicketId } from '../utils/ticketGenerator.js';

export const createRegistrationSchema = z.object({
  attendeeName: z
    .string({ required_error: 'Attendee name is required.' })
    .trim()
    .min(2, 'Attendee name must be at least 2 characters.')
    .max(100),
  attendeeEmail: z
    .string({ required_error: 'Attendee email is required.' })
    .trim()
    .email('Enter a valid email address.')
    .max(254)
    .transform((value) => value.toLowerCase()),
  eventId: objectId,
});

export const registrationParamsSchema = z.object({ id: objectId });
export const ticketParamsSchema = z.object({
  ticketId: z.string().trim().transform(parseTicketId).refine(Boolean, 'Invalid Ticket ID.'),
});
export const eventParamsSchema = z.object({ eventId: objectId });
export const registrationSearchQuerySchema = z.object({
  q: z.string().trim().max(100).optional(),
});

export const listRegistrationsQuerySchema = registrationSearchQuerySchema.extend({
  eventId: objectId.optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(50),
});
