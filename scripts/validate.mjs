import fs from 'node:fs';
import path from 'node:path';
import * as cheerio from 'cheerio';

const DIST = path.resolve('dist');
const walk = (d) => fs.readdirSync(d, { withFileTypes: true }).flatMap((e) =>
  e.isDirectory() ? walk(path.join(d, e.name)) : [path.join(d, e.name)]);

const files = walk(DIST).filter((f) => f.endsWith('.html'));
let issues = 0;
const titles = new Map();
const report = (msg) => { issues++; console.log('⚠ ' + msg); };

for (const f of files) {
  const rel = path.relative(DIST, f);
  const $ = cheerio.load(fs.readFileSync(f, 'utf8'));
  const title = $('title').first().text().trim();
  const desc = $('meta[name="description"]').attr('content') ?? '';
  const canonical = $('link[rel="canonical"]').attr('href') ?? '';
  if (!title) report(`${rel}: missing title`);
  else if (title.length > 70) report(`${rel}: title too long (${title.length})`);
  if (!desc) report(`${rel}: missing description`);
  else if (desc.length > 170) report(`${rel}: description too long (${desc.length})`);
  if (!canonical) report(`${rel}: missing canonical`);
  if (title) {
    if (titles.has(title)) report(`${rel}: duplicate title "${title}" (also ${titles.get(title)})`);
    else titles.set(title, rel);
  }
  $('img').each((_, el) => {
    const src = $(el).attr('src');
    const alt = $(el).attr('alt');
    if (!src) report(`${rel}: img without src`);
    if (alt === undefined || alt === null) report(`${rel}: img without alt (${src ?? ''})`);
  });
}

console.log(`Checked ${files.length} pages; issues: ${issues}`);
if (issues) process.exit(1);
