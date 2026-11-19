import fs from 'node:fs';
import path from 'node:path';
import * as cheerio from 'cheerio';

const DIST = path.resolve('dist');
const walk = (d) => fs.readdirSync(d, { withFileTypes: true }).flatMap((e) =>
  e.isDirectory() ? walk(path.join(d, e.name)) : [path.join(d, e.name)]);
const exists = (p) => {
  p = decodeURIComponent(p);
  if (p === '/') return fs.existsSync(path.join(DIST, 'index.html'));
  return [p, p + '.html'].some((c) => fs.existsSync(path.join(DIST, c)) && fs.statSync(path.join(DIST, c)).isFile());
};
const bad = new Map();
let html = 0, dotHtml = 0;
for (const f of walk(DIST).filter((f) => f.endsWith('.html'))) {
  html++;
  const $ = cheerio.load(fs.readFileSync(f, 'utf8'));
  $('a[href],link[href],script[src],img[src],link[rel=canonical]').each((_, el) => {
    const v = $(el).attr('href') ?? $(el).attr('src');
    if (!v || /^(https?:|mailto:|tel:|#|data:)/.test(v)) {
      if (v && /^https:\/\/defcoms\.eu/.test(v) && /\.html($|[#?])/.test(v)) dotHtml++;
      return;
    }
    const p = v.split(/[?#]/)[0];
    if (!p.startsWith('/')) return bad.set(`${path.relative(DIST, f)} -> ${v} (relative)`, 1);
    if (/\.html$/.test(p) && !/\/(404|chat-widget|google\w+)\.html$/.test(p)) dotHtml++;
    if (!exists(p)) bad.set(`${path.relative(DIST, f)} -> ${v}`, 1);
  });
}
// chat-widget.html is a legacy file, not a site page (see PLAN.md)
const broken = [...bad.keys()].filter((k) => !k.startsWith('chat-widget.html'));
console.log({ html, dotHtml, broken: broken.length });
broken.slice(0, 25).forEach((k) => console.log(k));
if (dotHtml || broken.length) process.exit(1);
