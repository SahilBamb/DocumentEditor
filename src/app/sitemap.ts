import type { MetadataRoute } from 'next';

const origin = 'https://document-editor-nu.vercel.app';

export default function sitemap(): MetadataRoute.Sitemap {
  return ['/', '/features', '/docs', '/review-ai-document-edits'].map(path => ({ url: origin + path }));
}
