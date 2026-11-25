import { getCollection } from 'astro:content';
import type { APIRoute } from 'astro';
import { site } from '../data/site';
import { execFileSync } from 'node:child_process';
import path from 'node:path';

function gitLastmod(filePath: string): string | undefined {
  try {
    const out = execFileSync('git', ['log', '-1', '--format=%cI', '--', filePath], { encoding: 'utf8' }).trim();
    if (!out) return undefined;
    return new Date(out).toISOString().slice(0, 10);
  } catch {
    return undefined;
  }
}

export const GET: APIRoute = async () => {
  const pages = await getCollection('pages', ({ data }) => !data.draft);
  const entries = pages
    .filter(({ id, data }) => id !== '404' && !data.canonical && !/noindex/i.test(data.robots ?? ''))
    .map(({ id, data }) => {
      const filePath = path.resolve('src/content/pages', id + '.html');
      const lastmod = data.lastmod?.toISOString().slice(0, 10) ?? gitLastmod(filePath);
      return {
        loc: site.url + (id === 'index' ? '/' : '/' + id),
        lastmod,
        changefreq: data.changefreq,
        priority: data.priority,
      };
    })
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
