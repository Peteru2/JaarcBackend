import { prisma } from '../../database/prisma';
import type { Prisma } from '../../generated/prisma/client';

interface FindManyOptions {
  page: number;
  limit: number;
  isRead?: boolean;
}

const create = async (data: Prisma.ContactSubmissionCreateInput) =>
  prisma.contactSubmission.create({ data, include: { service: true } });

const findMany = async (options: FindManyOptions) => {
  const where: Prisma.ContactSubmissionWhereInput =
    options.isRead !== undefined ? { isRead: options.isRead } : {};

  const [submissions, total] = await Promise.all([
    prisma.contactSubmission.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (options.page - 1) * options.limit,
      take: options.limit,
      include: { service: true },
    }),
    prisma.contactSubmission.count({ where }),
  ]);

  return { submissions, total };
};

const findById = async (id: string) =>
  prisma.contactSubmission.findUnique({
    where: { id },
    include: { service: true },
  });

const markAsRead = async (id: string) =>
  prisma.contactSubmission.update({
    where: { id },
    data: { isRead: true },
    include: { service: true },
  });

const remove = async (id: string) =>
  prisma.contactSubmission.delete({ where: { id } });

export const contactRepository = {
  create,
  findMany,
  findById,
  markAsRead,
  remove,
};