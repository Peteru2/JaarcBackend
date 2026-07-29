import type { BlogBlock } from '../types/blog.types';

const EXCERPT_LENGTH = 160;

export const buildExcerpt = (content: BlogBlock[]): string => {
  const firstParagraph = content.find(
    (block): block is Extract<BlogBlock, { type: 'paragraph' }> =>
      block.type === 'paragraph'
  );

  const source = firstParagraph?.text ?? '';

  if (source.length <= EXCERPT_LENGTH) return source;

  return `${source.slice(0, EXCERPT_LENGTH).trim()}...`;
};