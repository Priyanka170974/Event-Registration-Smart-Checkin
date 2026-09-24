import { z } from 'zod';
import { objectId } from './eventValidators.js';

export const checkInSchema = z.object({
  eventId: objectId,
  ticketId: z
    .string({ required_error: 'Ticket ID is required.' })
    .trim()
    .min(1, 'Ticket ID is required.')
    .max(120)
    .transform((value) => value.toUpperCase()),
});
