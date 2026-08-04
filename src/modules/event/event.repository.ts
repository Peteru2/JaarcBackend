import { prisma } from '../../database/prisma';
import type { Prisma, EventStatus } from '../../generated/prisma/client';

const listSlugs = async (): Promise<string[]> => {
  const events = await prisma.event.findMany({ select: { slug: true } });
  return events.map((event) => event.slug);
};

interface FindManyOptions {
  status?: EventStatus;
  page: number;
  limit: number;
}

const findMany = async (options: FindManyOptions) => {
  const where: Prisma.EventWhereInput = options.status
    ? { status: options.status }
    : {};

  const [events, total] = await Promise.all([
    prisma.event.findMany({
      where,
      orderBy: { startDate: 'asc' },
      skip: (options.page - 1) * options.limit,
      take: options.limit,
    }),
    prisma.event.count({ where }),
  ]);

  return { events, total };
};

const findBySlug = async (slug: string, status?: EventStatus) =>
  prisma.event.findFirst({ where: { slug, ...(status ? { status } : {}) } });

const findById = async (id: string) =>
  prisma.event.findUnique({ where: { id } });

const create = async (data: Prisma.EventCreateInput) =>
  prisma.event.create({ data });

const update = async (id: string, data: Prisma.EventUpdateInput) =>
  prisma.event.update({ where: { id }, data });

const remove = async (id: string) => prisma.event.delete({ where: { id } });

export const eventRepository = {
  listSlugs,
  findMany,
  findBySlug,
  findById,
  create,
  update,
  remove,
};