import type { BlogBlock } from '../types/blog.types';

const WORDS_PER_MINUTE = 200;

const countWords = (text: string): number =>
  text.trim().split(/\s+/).filter(Boolean).length;

export const calculateReadTime = (content: BlogBlock[]): number => {
  let wordCount = 0;

  for (const block of content) {
    switch (block.type) {
      case 'paragraph':
        wordCount += countWords(block.text);
        break;
      case 'quote':
        wordCount += countWords(block.quote);
        break;
      case 'list':
        wordCount += block.items.reduce(
          (sum, item) => sum + countWords(item),
          0
        );
        break;
      case 'section':
        wordCount += countWords(block.heading);
        if (block.subheading) wordCount += countWords(block.subheading);
        break;
      case 'cta':
        wordCount += countWords(block.title) + countWords(block.description);
        break;
      default:
        break;
    }
  }

  return Math.max(1, Math.ceil(wordCount / WORDS_PER_MINUTE));
};