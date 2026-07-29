import { Prisma, type Post, type PostStatus } from '../../generated/prisma/client';
import { ApiError } from '../../utils/ApiError';
import { buildPaginationMeta, type PaginationMeta } from '../../utils/ApiResponse';
import { buildUniqueSlug } from '../../utils/slugify';
import { calculateReadTime } from '../../utils/readTime';
import { buildExcerpt } from '../../utils/excerpt';
import { uploadService } from '../upload/upload.service';
import { blogRepository } from './blog.repository';
import type { CreatePostInput, UpdatePostInput } from './blog.validation';
import type { BlogBlock } from '../../types/blog.types';

interface RelatedPost {
  id: string;
  slug: string;
  title: string;
  image: string;
  readTime: number;
}

interface PublicPostDetail extends Post {
  relatedPosts: RelatedPost[];
}

const toJsonContent = (content: BlogBlock[]): Prisma.InputJsonValue =>
  content as unknown as Prisma.InputJsonValue;

const getPublishedList = async (
  page: number,
  limit: number,
  category?: string
): Promise<{ posts: unknown[]; meta: PaginationMeta }> => {
  const { posts, total } = await blogRepository.findMany({
    status: 'PUBLISHED',
    category,
    page,
    limit,
  });

  return { posts, meta: buildPaginationMeta(page, limit, total) };
};

const getFeatured = async (): Promise<unknown[]> =>
  blogRepository.findFeatured(6);

const getBySlug = async (slug: string): Promise<PublicPostDetail> => {
  const post = await blogRepository.findBySlug(slug, 'PUBLISHED');

  if (!post) {
    throw ApiError.notFound('Blog post not found.');
  }

  const relatedPosts = await blogRepository.findRelated(post.category, post.id);

  return { ...post, relatedPosts };
};

const getAdminList = async (
  page: number,
  limit: number,
  status?: PostStatus,
  category?: string
): Promise<{ posts: unknown[]; meta: PaginationMeta }> => {
  const { posts, total } = await blogRepository.findMany({
    status,
    category,
    page,
    limit,
  });

  return { posts, meta: buildPaginationMeta(page, limit, total) };
};

const getAdminById = async (id: string): Promise<Post> => {
  const post = await blogRepository.findById(id);

  if (!post) {
    throw ApiError.notFound('Blog post not found.');
  }

  return post;
};

const create = async (input: CreatePostInput): Promise<Post> => {
  const existingSlugs = new Set(await blogRepository.listSlugs());
  const slug = buildUniqueSlug(input.title, existingSlugs);

  const readTime = calculateReadTime(input.content);
  const excerpt = buildExcerpt(input.content);

  return blogRepository.create({
    slug,
    title: input.title,
    subtitle: input.subtitle,
    category: input.category,
    author: input.author,
    excerpt,
    readTime,
    image: input.image,
    imagePublicId: input.imagePublicId,
    pdfUrl: input.pdfUrl,
    pdfPublicId: input.pdfPublicId,
    featured: input.featured,
    content: toJsonContent(input.content),
    status: input.publish ? 'PUBLISHED' : 'DRAFT',
    publishedAt: input.publish ? new Date() : null,
  });
};

const update = async (id: string, input: UpdatePostInput): Promise<Post> => {
  const existing = await blogRepository.findById(id);

  if (!existing) {
    throw ApiError.notFound('Blog post not found.');
  }

  // Replacing the image: delete the old Cloudinary asset so it doesn't
  // sit orphaned in storage.
  if (
    input.imagePublicId &&
    existing.imagePublicId &&
    input.imagePublicId !== existing.imagePublicId
  ) {
    await uploadService.deleteAsset(existing.imagePublicId, 'image');
  }

  if (
    input.pdfPublicId &&
    existing.pdfPublicId &&
    input.pdfPublicId !== existing.pdfPublicId
  ) {
    await uploadService.deleteAsset(existing.pdfPublicId, 'raw');
  }

  // const content = input.content ?? (existing.content as unknown as BlogBlock[]);
  const readTime = input.content ? calculateReadTime(input.content) : undefined;
  const excerpt = input.content ? buildExcerpt(input.content) : undefined;

  const wasPublishedNow = !existing.publishedAt && input.publish === true;

  return blogRepository.update(id, {
    title: input.title,
    subtitle: input.subtitle,
    category: input.category,
    author: input.author,
    image: input.image,
    imagePublicId: input.imagePublicId,
    pdfUrl: input.pdfUrl,
    pdfPublicId: input.pdfPublicId,
    featured: input.featured,
    ...(input.content ? { content: toJsonContent(input.content) } : {}),
    ...(excerpt ? { excerpt } : {}),
    ...(readTime ? { readTime } : {}),
    ...(input.publish !== undefined
      ? { status: input.publish ? 'PUBLISHED' : 'DRAFT' }
      : {}),
    ...(wasPublishedNow ? { publishedAt: new Date() } : {}),
  });
};

const remove = async (id: string): Promise<void> => {
  const post = await blogRepository.findById(id);

  if (!post) {
    throw ApiError.notFound('Blog post not found.');
  }

  if (post.imagePublicId) {
    await uploadService.deleteAsset(post.imagePublicId, 'image');
  }

  if (post.pdfPublicId) {
    await uploadService.deleteAsset(post.pdfPublicId, 'raw');
  }

  await blogRepository.remove(id);
};

const publish = async (id: string): Promise<Post> => {
  const post = await blogRepository.findById(id);

  if (!post) {
    throw ApiError.notFound('Blog post not found.');
  }

  return blogRepository.update(id, {
    status: 'PUBLISHED',
    publishedAt: post.publishedAt ?? new Date(),
  });
};

export const blogService = {
  getPublishedList,
  getFeatured,
  getBySlug,
  getAdminList,
  getAdminById,
  create,
  update,
  remove,
  publish,
};