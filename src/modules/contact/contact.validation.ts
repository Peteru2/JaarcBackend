import { z } from 'zod';

export const createContactSubmissionSchema = z.object({
  firstName: z.string().trim().min(1, 'First name is required.').max(100),
  lastName: z.string().trim().min(1, 'Last name is required.').max(100),
  email: z.string().trim().toLowerCase().email('A valid email is required.'),
  phone: z.string().trim().max(30).optional(),
  message: z.string().trim().min(10, 'Message must be at least 10 characters.').max(2000),
  serviceId: z.string().trim().optional(),
});

export const listSubmissionsQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(50).default(20),
 isRead: z
  .enum(['true', 'false'])
  .optional()
  .transform((value) => (value === undefined ? undefined : value === 'true')),
});

export const idParamSchema = z.object({
  id: z.string().trim().min(1),
});

export type CreateContactSubmissionInput = z.infer<
  typeof createContactSubmissionSchema
>;
export type ListSubmissionsQuery = z.infer<typeof listSubmissionsQuerySchema>;