import { z } from 'zod';

const email = z
  .string({ required_error: 'Email is required.' })
  .trim()
  .email('Enter a valid email address.')
  .max(254)
  .transform((value) => value.toLowerCase());

const password = z
  .string({ required_error: 'Password is required.' })
  .min(8, 'Password must be at least 8 characters.')
  .max(128, 'Password cannot exceed 128 characters.')
  .regex(/[a-z]/, 'Password must include a lowercase letter.')
  .regex(/[A-Z]/, 'Password must include an uppercase letter.')
  .regex(/\d/, 'Password must include a number.');

export const signupSchema = z.object({
  name: z.string({ required_error: 'Name is required.' }).trim().min(2).max(100),
  email,
  password,
  role: z.enum(['organizer', 'volunteer']),
});

export const loginSchema = z.object({
  email,
  password: z.string({ required_error: 'Password is required.' }).min(1).max(128),
});
