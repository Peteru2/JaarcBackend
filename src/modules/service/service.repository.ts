import { prisma } from '../../database/prisma';
import type { Prisma } from '../../generated/prisma/client';

const findActive = async () =>
  prisma.service.findMany({
    where: { isActive: true },
    orderBy: { order: 'asc' },
  });

const findAll = async () =>
  prisma.service.findMany({ orderBy: { order: 'asc' } });

const findById = async (id: string) =>
  prisma.service.findUnique({ where: { id } });

const findByName = async (name: string) =>
  prisma.service.findUnique({ where: { name } });

const create = async (data: Prisma.ServiceCreateInput) =>
  prisma.service.create({ data });

const update = async (id: string, data: Prisma.ServiceUpdateInput) =>
  prisma.service.update({ where: { id }, data });

const remove = async (id: string) =>
  prisma.service.delete({ where: { id } });

export const serviceRepository = {
  findActive,
  findAll,
  findById,
  findByName,
  create,
  update,
  remove,
};