// One-off fix: keep category markup (glossary links) from legacy cards and store it as HTML strings.
import fs from 'node:fs';
import path from 'node:path';
import * as cheerio from 'cheerio';
import YAML from 'yaml';

const ROOT = path.resolve('src/content/pages');
const $ = cheerio.load(fs.readFileSync('legacy/blog/index.html', 'utf8'), { decodeEntities: false });
const clean = (h) => {
  const u = new URL(h, 'https://defcoms.eu/blog/');
  let p = u.pathname.replace(/(^|\/)index\.html$/, '$1').replace(/\.html$/, '');
  if (p.length > 1 && p.endsWith('/')) p = p.slice(0, -1);
  return p + u.search + u.hash;
};
let n = 0;
$('article.blog-listing-card').each((_, el) => {
  const $c = $(el);
  const id = clean($c.find('h2 a').attr('href')).slice(1);
  const meta = $c.find('.blog-listing-meta').clone();
  meta.find('time').remove();
  meta.find('a').each((_, a) => $(a).attr('href', clean($(a).attr('href'))));
  const cats = meta.html().split('·').map((s) => s.replace(/\s+/g, ' ').trim()).filter(Boolean);
  const file = path.join(ROOT, id + '.html');
  const m = fs.readFileSync(file, 'utf8').match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  const fm = YAML.parse(m[1]);
  fm.blog.categories = cats;
  fs.writeFileSync(file, `---\n${YAML.stringify(fm, { lineWidth: 0 })}---\n${m[2]}`);
  n++;
});
console.log({ n });
