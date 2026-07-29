import { z } from 'zod';

export const createServiceSchema = z.object({
  name: z.string().trim().min(1, 'Name is required.').max(120),
  order: z.number().int().min(0).default(0),
});

export const updateServiceSchema = z.object({
  name: z.string().trim().min(1).max(120).optional(),
  isActive: z.boolean().optional(),
  order: z.number().int().min(0).optional(),
});

export const idParamSchema = z.object({
  id: z.string().trim().min(1),
});

export type CreateServiceInput = z.infer<typeof createServiceSchema>;
export type UpdateServiceInput = z.infer<typeof updateServiceSchema>;