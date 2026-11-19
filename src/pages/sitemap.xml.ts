import { getCollection } from 'astro:content';
import type { APIRoute } from 'astro';
import { site } from '../data/site';

export const GET: APIRoute = async () => {
  const pages = await getCollection('pages', ({ data }) => !data.draft);
  const entries = pages
    .filter(({ id, data }) => id !== '404' && !data.canonical && !/noindex/i.test(data.robots ?? ''))
    .map(({ id, data }) => ({
      loc: site.url + (id === 'index' ? '/' : '/' + id),
      lastmod: data.lastmod?.toISOString().slice(0, 10),
      changefreq: data.changefreq,
      priority: data.priority,
    }))
    .sort((a, b) => a.loc.localeCompare(b.loc));

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries
  .map(
    (e) =>
      `  <url>\n    <loc>${e.loc}</loc>` +
      (e.lastmod ? `\n    <lastmod>${e.lastmod}</lastmod>` : '') +
      (e.changefreq ? `\n    <changefreq>${e.changefreq}</changefreq>` : '') +
      (e.priority != null ? `\n    <priority>${e.priority}</priority>` : '') +
      `\n  </url>`,
  )
  .join('\n')}
</urlset>
`;
  return new Response(xml, { headers: { 'Content-Type': 'application/xml' } });
};
