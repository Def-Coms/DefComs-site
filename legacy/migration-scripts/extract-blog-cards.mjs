// One-off: moves blog listing cards from blog/index.html into each article's frontmatter (`blog:`),
// and replaces the hand-written card list with a <!--@listing--> marker.
import fs from 'node:fs';
import path from 'node:path';
import * as cheerio from 'cheerio';
import YAML from 'yaml';

const ROOT = path.resolve('src/content/pages');
const indexFile = path.join(ROOT, 'blog/index.html');
const src = fs.readFileSync(indexFile, 'utf8');
const [, fmText, body] = src.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
const $ = cheerio.load(body, { decodeEntities: false }, false);

const missing = [];
let order = 0;
$('article.blog-listing-card').each((_, el) => {
  const $c = $(el);
  const href = $c.find('h2 a').attr('href');
  const id = href.replace(/^\//, '');
  const file = path.join(ROOT, id + '.html');
  if (!fs.existsSync(file)) return missing.push(href);
  const img = $c.find('a > img').first();
  const meta = $c.find('.blog-listing-meta');
  const time = meta.find('time');
  const cats = meta.clone().children().remove().end().text().split('·').map((s) => s.replace(/\s+/g, ' ').trim()).filter(Boolean);
  const card = {
    categories: cats.map((c) => c.replace(/&amp;/g, '&')),
    date: time.attr('datetime'),
    order: order++,
    title: $c.find('h2 a').html().trim(),
    summary: $c.find('.blog-listing-content > p').html().trim(),
    image: img.attr('src'),
    imageAlt: img.attr('alt'),
    imageWidth: Number(img.attr('width')),
    imageHeight: Number(img.attr('height')),
    ariaLabel: $c.find('a[aria-label]').first().attr('aria-label'),
    cta: $c.find('.blog-listing-content > a').last().text().trim(),
  };
  const m = fs.readFileSync(file, 'utf8').match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  const fm = YAML.parse(m[1]);
  fm.blog = card;
  fs.writeFileSync(file, `---\n${YAML.stringify(fm, { lineWidth: 0 })}---\n${m[2]}`);
});
console.log({ cards: order, missing });

$('section.blog-listing').html('\n<!--@listing-->\n');
const fm = YAML.parse(fmText);
fm.listing = 'blog';
fs.writeFileSync(indexFile, `---\n${YAML.stringify(fm, { lineWidth: 0 })}---\n${$.html()}`);
