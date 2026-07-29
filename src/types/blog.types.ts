export type BlogBlock =
  | { type: 'paragraph'; text: string }
  | { type: 'quote'; quote: string; owner?: string }
  | { type: 'list'; items: string[] }
  | { type: 'video'; url: string }
  | {
      type: 'cta';
      title: string;
      description: string;
      buttonText: string;
      buttonLink: string;
    }
  | { type: 'section'; heading: string; subheading?: string }
  | { type: 'image'; src: string; alt?: string; caption?: string }
  | { type: 'relatedPosts' };