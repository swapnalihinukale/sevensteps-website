import { loadSiteContent } from '../lib/site-content';
export const prerender = true;
export function GET() {
  const content = loadSiteContent();
  const paths = content ? ['/', ...content.stories.map(story => `/stories/${story.id}/`)] : [];
  const xml = `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${paths.map(path => `<url><loc>${new URL(path, content!.site.origin).href}</loc></url>`).join('')}</urlset>`;
  return new Response(xml, { headers: { 'Content-Type': 'application/xml; charset=utf-8' } });
}
