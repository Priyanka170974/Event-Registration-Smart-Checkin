import { z } from 'zod';

export const objectId = z.string().regex(/^[a-f\d]{24}$/i, 'Invalid identifier.');

const dateString = z
  .string({ required_error: 'Event date is required.' })
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Use a valid date in YYYY-MM-DD format.')
  .refine((value) => {
    const parsed = new Date(`${value}T00:00:00.000Z`);
    return !Number.isNaN(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value;
  }, 'Enter a valid calendar date.');

const timeString = z
  .string({ required_error: 'Event time is required.' })
  .regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'Use 24-hour HH:MM format.');

export const createEventSchema = z.object({
  name: z.string({ required_error: 'Event name is required.' }).trim().min(2).max(120),
  description: z
    .string({ required_error: 'Description is required.' })
    .trim()
    .min(10, 'Description must be at least 10 characters.')
    .max(5000),
  date: dateString,
  time: timeString,
  venue: z.string({ required_error: 'Venue is required.' }).trim().min(2).max(200),
  capacity: z.coerce
    .number({ required_error: 'Capacity is required.' })
    .int('Capacity must be a whole number.')
    .min(1, 'Capacity must be at least 1.')
    .max(100000, 'Capacity cannot exceed 100,000.'),
});

export const updateEventSchema = createEventSchema.partial().refine(
  (value) => Object.keys(value).length > 0,
  'Provide at least one field to update.',
);

export const eventParamsSchema = z.object({ id: objectId });

export const listEventsQuerySchema = z.object({
  q: z.string().trim().max(100).optional(),
  status: z.enum(['all', 'open', 'full']).default('all'),
  limit: z.coerce.number().int().min(1).max(100).default(50),
  page: z.coerce.number().int().min(1).default(1),
});
