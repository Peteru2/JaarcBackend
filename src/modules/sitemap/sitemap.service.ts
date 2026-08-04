import { prisma } from '../../database/prisma';

const SITE_URL = 'https://jaarc.org';

const STATIC_ROUTES = [
  '',
  '/about',
  '/blog',
  '/events',
  '/team',
  '/gallery',
  '/expertise/deta',
  '/expertise/dlc',
  '/expertise/cbt',
];

const escapeXml = (value: string): string =>
  value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

const buildUrlEntry = (path: string, lastmod?: Date): string => `
  <url>
    <loc>${escapeXml(`${SITE_URL}${path}`)}</loc>
    ${lastmod ? `<lastmod>${lastmod.toISOString()}</lastmod>` : ''}
  </url>`;

const generate = async (): Promise<string> => {
  const [posts, events] = await Promise.all([
    prisma.post.findMany({
      where: { status: 'PUBLISHED' },
      select: { slug: true, updatedAt: true },
    }),
    prisma.event.findMany({
      where: { status: 'PUBLISHED' },
      select: { slug: true, updatedAt: true },
    }),
  ]);

  const staticEntries = STATIC_ROUTES.map((route) => buildUrlEntry(route));
  const postEntries = posts.map((post) =>
    buildUrlEntry(`/blog/${post.slug}`, post.updatedAt)
  );
  const eventEntries = events.map((event) =>
    buildUrlEntry(`/events/${event.slug}`, event.updatedAt)
  );

  const allEntries = [...staticEntries, ...postEntries, ...eventEntries].join('');

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${allEntries}
</urlset>`;
};

export const sitemapService = { generate };