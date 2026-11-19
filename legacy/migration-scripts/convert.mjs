// One-off: converts the extracted legacy page JSON (src/data/pages) into content files
// with frontmatter (src/content/pages). Shared header/footer/scripts move into the layout.
import fs from 'node:fs';
import path from 'node:path';
import * as cheerio from 'cheerio';
import YAML from 'yaml';

const IN = path.resolve('src/data/pages');
const OUT = path.resolve('src/content/pages');
const ORIGIN = 'https://defcoms.eu';
const DEFAULT_ROBOTS = 'index, follow, max-snippet:-1, max-image-preview:large';
const DEFAULT_IMAGE = ORIGIN + '/images/PR_image/Киберсигурността__Щит_на_модерния_бизнес.webp';
const LAYOUT_SCRIPTS = new Set(['/script.js', '/cookie-consent.js', '/chat-widget.js']);
const EXTRA_SCRIPTS = new Set(['/wizard.js', '/landing.js', '/blog/blog.js']);

fs.rmSync(OUT, { recursive: true, force: true });

const stripTrailingSlash = (s) =>
  s.replace(/https:\/\/defcoms\.eu\/([^"'\s<>#?\\]*?)\/(?=["'\s<>#?\\]|$)/g, 'https://defcoms.eu/$1');

const stats = { headExtra: 0, extraScripts: 0, canonicalOverride: 0, leftoverScripts: 0 };
const report = [];

for (const f of fs.readdirSync(IN)) {
  const p = JSON.parse(fs.readFileSync(path.join(IN, f), 'utf8'));
  const $ = cheerio.load(`<head>${p.head}</head>`, { decodeEntities: false });
  const meta = (sel) => $(`meta[${sel}]`).attr('content');
  const fm = {};
  const canonicalUrl = ORIGIN + (p.route === '/' ? '/' : p.route);

  fm.title = $('title').text().trim();
  fm.description = meta('name="description"') ?? '';
  const robots = meta('name="robots"');
  if (robots && robots !== DEFAULT_ROBOTS) fm.robots = robots;
  const canonical = $('link[rel="canonical"]').attr('href');
  if (canonical && stripTrailingSlash(canonical) !== canonicalUrl.replace(/\/$/, '') && canonical !== canonicalUrl) {
    fm.canonical = canonical;
    stats.canonicalOverride++;
    report.push(`canonical override ${p.route} -> ${canonical}`);
  }
  const ogType = meta('property="og:type"');
  if (ogType && ogType !== 'website') fm.ogType = ogType;
  const img = meta('property="og:image"') ?? meta('name="twitter:image"');
  if (img && img !== DEFAULT_IMAGE) fm.image = img;
  const imgAlt = meta('property="og:image:alt"');
  if (imgAlt) fm.imageAlt = imgAlt;
  const ogTitle = meta('property="og:title"');
  if (ogTitle && ogTitle !== fm.title) fm.ogTitle = ogTitle;
  const ogDesc = meta('property="og:description"');
  if (ogDesc && ogDesc !== fm.description) fm.ogDescription = ogDesc;
  const twTitle = meta('name="twitter:title"');
  if (twTitle && twTitle !== (fm.ogTitle ?? fm.title)) fm.twitterTitle = twTitle;
  const twDesc = meta('name="twitter:description"');
  if (twDesc && twDesc !== (fm.ogDescription ?? fm.description)) fm.twitterDescription = twDesc;

  const extraMeta = {};
  $('meta[name]').each((_, el) => {
    const n = $(el).attr('name');
    if (['viewport', 'description', 'robots'].includes(n) || n.startsWith('twitter:')) return;
    extraMeta[n] = $(el).attr('content');
  });
  if (Object.keys(extraMeta).length) fm.meta = extraMeta;

  const schema = [];
  const headExtra = [];
  $('script[type="application/ld+json"]').each((_, el) => {
    try {
      schema.push(JSON.parse(stripTrailingSlash($(el).html())));
    } catch {
      headExtra.push($.html(el));
      report.push(`bad json-ld ${p.route}`);
    }
  });
  if (schema.length) fm.schema = schema;

  $('link').each((_, el) => {
    const rel = $(el).attr('rel') || '';
    const href = $(el).attr('href') || '';
    if (['canonical', 'alternate', 'sitemap', 'llms.txt', 'preconnect', 'icon'].includes(rel)) return;
    if (rel === 'stylesheet' && (href === '/styles.css' || href.startsWith('https://fonts.googleapis.com'))) return;
    if (href.startsWith('https://fonts.googleapis.com')) return;
    headExtra.push($.html(el));
  });
  $('style').each((_, el) => headExtra.push($.html(el)));
  $('script:not([type="application/ld+json"])').each((_, el) => headExtra.push($.html(el)));
  if (headExtra.length) {
    fm.headExtra = headExtra.join('\n');
    stats.headExtra++;
  }

  // Body
  const bodyClass = p.bodyAttrs?.class;
  if (bodyClass) fm.bodyClass = bodyClass;
  const otherAttrs = { ...p.bodyAttrs };
  delete otherAttrs.class;
  if (Object.keys(otherAttrs).length) fm.bodyAttrs = otherAttrs;

  const bare = !p.header && !p.footer;
  if (bare) fm.layout = 'bare';

  const raw = bare ? p.pre : p.pre + p.mid + p.post;
  const $b = cheerio.load(`<div id="__r">${raw}</div>`, { decodeEntities: false });
  const pageScripts = [];
  if (!bare) {
    $b('#__r script').each((_, el) => {
      const src = $b(el).attr('src');
      const code = $b(el).html() || '';
      if (src && LAYOUT_SCRIPTS.has(src)) return $b(el).remove();
      if (src && EXTRA_SCRIPTS.has(src)) {
        pageScripts.push(src);
        return $b(el).remove();
      }
      if (!src && /cookie_consent/.test(code) && /track\.php/.test(code)) return $b(el).remove();
      stats.leftoverScripts++;
    });
    $b('#__r .mobile-nav-overlay').remove();
  }
  if (pageScripts.length) fm.scripts = pageScripts;

  $b('#__r')
    .contents()
    .filter((_, n) => n.type === 'comment')
    .remove();
  let body = $b('#__r').html().replace(/<!--[\s\S]*?-->/g, '').replace(/\n{3,}/g, '\n\n').trim();
  if (bare) body = body.trim();

  const rel = p.route === '/' ? 'index' : p.route.slice(1);
  const hasChildren = fs.readdirSync(IN).some((o) => o.startsWith(rel.replace(/\//g, '__') + '__'));
  const file = path.join(OUT, hasChildren ? rel + '/index' : rel) + '.html';
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, `---\n${YAML.stringify(fm, { lineWidth: 0 })}---\n${stripTrailingSlash(body)}\n`);
}

console.log(stats);
console.log(report.join('\n'));
