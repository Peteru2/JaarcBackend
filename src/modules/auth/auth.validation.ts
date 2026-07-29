import { z } from 'zod';

export const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .toLowerCase()
    .min(1, 'Email is required.')
    .email('A valid email address is required.'),
  password: z
    .string()
    .min(1, 'Password is required.'),
});

export type LoginInput = z.infer<typeof loginSchema>;