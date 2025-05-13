import * as sanitizeHtml from 'sanitize-html';

const DEFAULT_ALLOWED_TAGS = sanitizeHtml.defaults.allowedTags.concat([
  'h1',
  'h2',
  'h3',
  'img',
  'a',
  'ul',
  'ol',
  'li',
  'p',
  'strong',
  'em',
]);

const DEFAULT_ALLOWED_ATTR = {
  ...sanitizeHtml.defaults.allowedAttributes,
  a: ['href', 'target', 'rel'],
  img: ['src', 'alt', 'width', 'height'],
};

export function sanitizerHtml(dirty: string): string {
  return sanitizeHtml(dirty, {
    allowedTags: DEFAULT_ALLOWED_TAGS,
    allowedAttributes: DEFAULT_ALLOWED_ATTR,
    transformTags: {
      a: (tagName, attribs) => ({
        tagName: 'a',
        attribs: {
          ...attribs,
          target: '_blank',
          rel: 'noopener noreferrer',
        },
      }),
    },
    allowedSchemes: sanitizeHtml.defaults.allowedSchemes.concat([
      'data',
      'https',
      'http',
    ]),
  });
}
