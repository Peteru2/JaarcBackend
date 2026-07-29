import { prisma } from '../../database/prisma';

interface UserRecord {
  id: string;
  email: string;
  name: string;
  password: string;
}

const findByEmail = async (email: string): Promise<UserRecord | null> =>
  prisma.user.findUnique({
    where: { email: email.toLowerCase() },
    select: { id: true, email: true, name: true, password: true },
  });

const findById = async (id: string): Promise<UserRecord | null> =>
  prisma.user.findUnique({
    where: { id },
    select: { id: true, email: true, name: true, password: true },
  });

export const authRepository = {
  findByEmail,
  findById,
};