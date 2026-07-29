export const slugify = (value: string): string =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');

export const buildUniqueSlug = (
  base: string,
  existingSlugs: Set<string>
): string => {
  const slug = slugify(base);

  if (!existingSlugs.has(slug)) return slug;

  let suffix = 2;
  let candidate = `${slug}-${suffix}`;

  while (existingSlugs.has(candidate)) {
    suffix += 1;
    candidate = `${slug}-${suffix}`;
  }

  return candidate;
};