import { z } from 'zod';

const paragraphBlock = z.object({
  type: z.literal('paragraph'),
  text: z.string().trim().min(1, 'Paragraph text cannot be empty.'),
});

const quoteBlock = z.object({
  type: z.literal('quote'),
  quote: z.string().trim().min(1, 'Quote cannot be empty.'),
  owner: z.string().trim().optional(),
});

const listBlock = z.object({
  type: z.literal('list'),
  items: z
    .array(z.string().trim().min(1))
    .min(1, 'A list must contain at least one item.'),
});

const videoBlock = z.object({
  type: z.literal('video'),
  url: z.string().url('A valid video URL is required.'),
});

const ctaBlock = z.object({
  type: z.literal('cta'),
  title: z.string().trim().min(1),
  description: z.string().trim().min(1),
  buttonText: z.string().trim().min(1),
  buttonLink: z.string().url('A valid button link URL is required.'),
});

const sectionBlock = z.object({
  type: z.literal('section'),
  heading: z.string().trim().min(1),
  subheading: z.string().trim().optional(),
});

const imageBlock = z.object({
  type: z.literal('image'),
  src: z.string().url('A valid image URL is required.'),
  alt: z.string().trim().optional(),
  caption: z.string().trim().optional(),
});

const relatedPostsBlock = z.object({
  type: z.literal('relatedPosts'),
});

export const blogBlockSchema = z.discriminatedUnion('type', [
  paragraphBlock,
  quoteBlock,
  listBlock,
  videoBlock,
  ctaBlock,
  sectionBlock,
  imageBlock,
  relatedPostsBlock,
]);

export const createPostSchema = z.object({
  title: z.string().trim().min(1, 'Title is required.').max(200),
  subtitle: z.string().trim().max(300).optional(),
  category: z.string().trim().min(1, 'Category is required.').max(80),
  author: z.string().trim().max(120).optional(),
  image: z.string().url('A valid image URL is required.'),
  imagePublicId: z.string().trim().optional(),
  pdfUrl: z.string().url().optional(),
  pdfPublicId: z.string().trim().optional(),
  featured: z.boolean().default(false),
  content: z
    .array(blogBlockSchema)
    .min(1, 'A post must contain at least one content block.'),
  publish: z.boolean().default(false),
});

export const updatePostSchema = createPostSchema.partial();

export const listPostsQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(50).default(10),
  category: z.string().trim().optional(),
});

export const adminListPostsQuerySchema = listPostsQuerySchema.extend({
  status: z.enum(['DRAFT', 'PUBLISHED']).optional(),
});

export const slugParamSchema = z.object({
  slug: z.string().trim().min(1),
});

export const idParamSchema = z.object({
  id: z.string().trim().min(1),
});

export type CreatePostInput = z.infer<typeof createPostSchema>;
export type UpdatePostInput = z.infer<typeof updatePostSchema>;
export type ListPostsQuery = z.infer<typeof listPostsQuerySchema>;
export type AdminListPostsQuery = z.infer<typeof adminListPostsQuerySchema>;