import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import bcrypt from 'bcrypt';
import { PrismaClient } from '../src/generated/prisma/client';

const CONTACT_SERVICES = [
  'Digital Literacy Class (DLC)',
  'Digital Marketing',
  'Digital Education for Teachers and Adult',
  'Other',
] as const;

const toSlug = (value: string): string =>
  value
    .toLowerCase()
    .replace(/\([^)]*\)/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

const main = async (): Promise<void> => {
  const connectionString = process.env['DIRECT_URL'];

  if (!connectionString) {
    throw new Error('DIRECT_URL is not defined.');
  }

  const adapter = new PrismaPg({ connectionString });
  const prisma = new PrismaClient({ adapter });

  try {
    const email = process.env['ADMIN_EMAIL'];
    const password = process.env['ADMIN_PASSWORD'];
    const name = process.env['ADMIN_NAME'];

    if (!email || !password || !name) {
      throw new Error(
        'ADMIN_EMAIL, ADMIN_PASSWORD and ADMIN_NAME must be defined.'
      );
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const admin = await prisma.user.upsert({
      where: { email: email.toLowerCase() },
      update: {},
      create: {
        email: email.toLowerCase(),
        password: hashedPassword,
        name,
      },
      select: { id: true, email: true },
    });

    console.log(`Admin user ready: ${admin.email}`);

    for (const [index, serviceName] of CONTACT_SERVICES.entries()) {
      await prisma.service.upsert({
        where: { name: serviceName },
        update: {},
        create: {
          name: serviceName,
          slug: toSlug(serviceName),
          order: index,
        },
      });
    }

    console.log(`Seeded ${CONTACT_SERVICES.length} contact services.`);
  } finally {
    await prisma.$disconnect();
  }
};

void main().catch((error: unknown) => {
  console.error('Seeding failed:', error);
  process.exit(1);
});