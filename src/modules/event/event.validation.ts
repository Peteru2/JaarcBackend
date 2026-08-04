import { z } from 'zod';
import { blogBlockSchema } from '../blog/blog.validation';

export const createEventSchema = z.object({
  title: z.string().trim().min(1, 'Title is required.').max(200),
  tags: z.array(z.string().trim().min(1)).default([]),
  host: z.string().trim().min(1, 'Host is required.').max(150),
  locationType: z.enum(['PHYSICAL', 'VIRTUAL']),
  locationValue: z.string().trim().min(1, 'Location is required.').max(300),
  startDate: z.coerce.date(),
  endDate: z.coerce.date().optional(),
  image: z.string().url('A valid image URL is required.'),
  imagePublicId: z.string().trim().optional(),
  excerpt: z.string().trim().min(1).max(300),
  description: z
    .array(blogBlockSchema)
    .min(1, 'Event description must contain at least one content block.'),
  registrationUrl: z.string().url().optional(),
  publish: z.boolean().default(false),
})
  .refine(
    (data) => !data.endDate || data.endDate >= data.startDate,
    { message: 'End date cannot be before start date.', path: ['endDate'] }
  );

export const updateEventSchema = z.object({
  title: z.string().trim().min(1).max(200).optional(),
  tags: z.array(z.string().trim().min(1)).optional(),
  host: z.string().trim().min(1).max(150).optional(),
  locationType: z.enum(['PHYSICAL', 'VIRTUAL']).optional(),
  locationValue: z.string().trim().min(1).max(300).optional(),
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
  image: z.string().url().optional(),
  imagePublicId: z.string().trim().optional(),
  excerpt: z.string().trim().min(1).max(300).optional(),
  description: z.array(blogBlockSchema).min(1).optional(),
  registrationUrl: z.string().url().optional(),
  publish: z.boolean().optional(),
});

export const listEventsQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(50).default(10),
  filter: z.enum(['upcoming', 'ongoing', 'past']).optional(),
});

export const adminListEventsQuerySchema = listEventsQuerySchema.extend({
  status: z.enum(['DRAFT', 'PUBLISHED']).optional(),
});

export const slugParamSchema = z.object({ slug: z.string().trim().min(1) });
export const idParamSchema = z.object({ id: z.string().trim().min(1) });

export type CreateEventInput = z.infer<typeof createEventSchema>;
export type UpdateEventInput = z.infer<typeof updateEventSchema>;
export type ListEventsQuery = z.infer<typeof listEventsQuerySchema>;
export type AdminListEventsQuery = z.infer<typeof adminListEventsQuerySchema>;