import { loadSiteContent, renderMode } from '../lib/site-content';
export const prerender = true;
export function GET() {
  const content = loadSiteContent();
  const body = renderMode() === 'public' && content ? `User-agent: *\nAllow: /\nSitemap: ${content.site.origin}/sitemap.xml\n` : 'User-agent: *\nDisallow: /\n';
  return new Response(body, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
}
