// One-off: copies <lastmod>/<changefreq>/<priority> from the legacy sitemap into page frontmatter.
import fs from 'node:fs';
import path from 'node:path';

const xml = fs.readFileSync('legacy/sitemap.xml', 'utf8');
const ROOT = path.resolve('src/content/pages');
let hit = 0, miss = [];

for (const m of xml.matchAll(/<url>([\s\S]*?)<\/url>/g)) {
  const loc = m[1].match(/<loc>https:\/\/defcoms\.eu(.*?)<\/loc>/)[1];
  let id = loc.replace(/\.html$/, '').replace(/\/index$/, '').replace(/\/$/, '').replace(/^\//, '') || 'index';
  const tag = (t) => m[1].match(new RegExp(`<${t}>(.*?)</${t}>`))?.[1];
  const candidates = [`${id}.html`, `${id}/index.html`];
  const file = candidates.map((c) => path.join(ROOT, c)).find((c) => fs.existsSync(c));
  if (!file) { miss.push(loc); continue; }
  const add = [];
  if (tag('lastmod')) add.push(`lastmod: ${tag('lastmod')}`);
  if (tag('changefreq')) add.push(`changefreq: ${tag('changefreq')}`);
  if (tag('priority')) add.push(`priority: ${tag('priority')}`);
  const src = fs.readFileSync(file, 'utf8');
  fs.writeFileSync(file, src.replace(/^---\n/, `---\n${add.join('\n')}\n`));
  hit++;
}
console.log({ hit, miss });
