import { prisma } from '../../database/prisma';
import type { Prisma, PostStatus } from '../../generated/prisma/client';

const RELATED_POSTS_LIMIT = 3;

const listSlugs = async (): Promise<string[]> => {
  const posts = await prisma.post.findMany({ select: { slug: true } });
  return posts.map((post) => post.slug);
};

interface FindManyOptions {
  status?: PostStatus;
  category?: string;
  page: number;
  limit: number;
}

const findMany = async (options: FindManyOptions) => {
  const where: Prisma.PostWhereInput = {
    ...(options.status ? { status: options.status } : {}),
    ...(options.category ? { category: options.category } : {}),
  };

  const [posts, total] = await Promise.all([
    prisma.post.findMany({
      where,
      orderBy: { publishedAt: 'desc' },
      skip: (options.page - 1) * options.limit,
      take: options.limit,
      select: {
        id: true,
        slug: true,
        title: true,
        subtitle: true,
        category: true,
        author: true,
        excerpt: true,
        readTime: true,
        image: true,
        featured: true,
        status: true,
        publishedAt: true,
        createdAt: true,
      },
    }),
    prisma.post.count({ where }),
  ]);

  return { posts, total };
};

const findFeatured = async (limit: number) =>
  prisma.post.findMany({
    where: { status: 'PUBLISHED', featured: true },
    orderBy: { publishedAt: 'desc' },
    take: limit,
    select: {
      id: true,
      slug: true,
      title: true,
      subtitle: true,
      category: true,
      author: true,
      excerpt: true,
      readTime: true,
      image: true,
      featured: true,
      publishedAt: true,
    },
  });

const findBySlug = async (slug: string, status?: PostStatus) =>
  prisma.post.findFirst({
    where: { slug, ...(status ? { status } : {}) },
  });

const findById = async (id: string) => prisma.post.findUnique({ where: { id } });

const findRelated = async (
  category: string,
  excludeId: string
): Promise<                    
  Array<{
    id: string;
    slug: string;
    title: string;
    image: string;
    readTime: number;
  }>
> =>
  prisma.post.findMany({
    where: {
      category,
      status: 'PUBLISHED',
      id: { not: excludeId },
    },
    orderBy: { publishedAt: 'desc' },
    take: RELATED_POSTS_LIMIT,
    select: { id: true, slug: true, title: true, image: true, readTime: true },
  })
;

const create = async (data: Prisma.PostCreateInput) =>
  prisma.post.create({ data });

const update = async (id: string, data: Prisma.PostUpdateInput) =>
  prisma.post.update({ where: { id }, data });

const remove = async (id: string) => prisma.post.delete({ where: { id } });

export const blogRepository = {
  listSlugs,
  findMany,
  findFeatured,
  findBySlug,
  findById,
  findRelated,
  create,
  update,
  remove,
};