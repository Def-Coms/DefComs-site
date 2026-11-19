import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import * as cheerio from 'cheerio';

const SRC = process.argv[2];
const OUT = path.resolve('src/data/pages');
const PUB = path.resolve('public');
const ORIGIN = 'https://defcoms.eu';
const SKIP_DIRS = new Set(['git', 'node_modules']);
const NON_PAGES = new Set(['chat-widget.html']);
const ASSET_ONLY_HTML = /^google[0-9a-f]+\.html$/;

fs.rmSync(OUT, { recursive: true, force: true });
fs.mkdirSync(OUT, { recursive: true });

function walk(dir, rel = '') {
  const res = [];
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const r = path.posix.join(rel, e.name);
    if (e.isDirectory()) {
      if (!SKIP_DIRS.has(e.name)) res.push(...walk(path.join(dir, e.name), r));
    } else res.push(r);
  }
  return res;
}

export function cleanPath(p) {
  p = p.replace(/(^|\/)index\.html$/, '$1').replace(/\.html$/, '');
  if (p.length > 1 && p.endsWith('/')) p = p.slice(0, -1);
  return p || '/';
}

const files = walk(SRC);
const isPage = (f) =>
  f.endsWith('.html') && !NON_PAGES.has(f) && !ASSET_ONLY_HTML.test(f) &&
  !f.startsWith('analytics/') && !f.startsWith('info/');
const pages = files.filter(isPage);

function rewriteUrl(val, pageFile) {
  if (!val || /^(mailto:|tel:|javascript:|data:|#)/i.test(val)) return val;
  let u;
  try {
    u = new URL(val, `${ORIGIN}/${pageFile}`);
  } catch {
    return val;
  }
  if (u.origin !== ORIGIN) return val;
  const hasExt = /\.[a-z0-9]+$/i.test(u.pathname) && !u.pathname.endsWith('.html');
  const p = hasExt ? u.pathname : cleanPath(u.pathname);
  const out = p + u.search + u.hash;
  return /^https?:/i.test(val) ? ORIGIN + (out === '/' ? '/' : out) : out;
}

function rewriteAbsInText(s) {
  return s.replace(/https:\/\/defcoms\.eu(\/[^"'\s<>#?\\]*?\.html|\/(?=["'\s<>#?\\]))/g, (m, p) => {
    const c = cleanPath(p);
    return ORIGIN + (c === '/' ? '/' : c);
  });
}

const PARTIALS = path.resolve('src/data/partials');
fs.rmSync(PARTIALS, { recursive: true, force: true });
fs.mkdirSync(PARTIALS, { recursive: true });
function savePartial(html) {
  if (!html) return '';
  const id = crypto.createHash('md5').update(html).digest('hex').slice(0, 8);
  fs.writeFileSync(path.join(PARTIALS, id + '.html'), html);
  return id;
}

const manifest = [];
const hashes = { header: new Map(), footer: new Map() };

for (const f of pages) {
  const html = fs.readFileSync(path.join(SRC, f), 'utf8');
  const $ = cheerio.load(html, { decodeEntities: false }, true);
  for (const [sel, attrs] of [
    ['a', ['href']], ['link', ['href']], ['script', ['src']], ['img', ['src', 'srcset']],
    ['source', ['src', 'srcset']], ['form', ['action']], ['iframe', ['src']],
    ['video', ['src', 'poster']], ['meta', ['content']],
  ]) {
    $(sel).each((_, el) => {
      for (const a of attrs) {
        const v = $(el).attr(a);
        if (v == null) continue;
        if (sel === 'meta') {
          if (/^https?:\/\/defcoms\.eu/.test(v)) $(el).attr(a, rewriteAbsInText(v));
        } else if (a === 'srcset') {
          $(el).attr(a, v.split(',').map((x) => {
            const [u, ...r] = x.trim().split(/\s+/);
            return [rewriteUrl(u, f), ...r].join(' ');
          }).join(', '));
        } else $(el).attr(a, rewriteUrl(v, f));
      }
    });
  }
  $('script[type="application/ld+json"]').each((_, el) => {
    $(el).html(rewriteAbsInText($(el).html()));
  });

  const route = cleanPath('/' + f);
  const bodyEl = $('body');
  const bodyAttrs = { ...bodyEl.attr() };
  const headHtml = $('head').html().trim();
  const header = $('body > header').first();
  const footer = $('body > footer').first();
  const bodyHtml = bodyEl.html();
  const hh = header.length ? $.html(header) : '';
  const fh = footer.length ? $.html(footer) : '';
  let pre = bodyHtml, mid = '', post = '';
  if (hh && fh) {
    const i = bodyHtml.indexOf(hh), j = bodyHtml.indexOf(fh);
    if (i >= 0 && j > i) {
      pre = bodyHtml.slice(0, i);
      mid = bodyHtml.slice(i + hh.length, j);
      post = bodyHtml.slice(j + fh.length);
    }
  }
  const h = (s) => crypto.createHash('md5').update(s).digest('hex').slice(0, 8);
  hashes.header.set(h(hh), (hashes.header.get(h(hh)) || []).concat(route));
  hashes.footer.set(h(fh), (hashes.footer.get(h(fh)) || []).concat(route));

  const name = (route === '/' ? 'index' : route.slice(1).replace(/\//g, '__')) + '.json';
  fs.writeFileSync(path.join(OUT, name), JSON.stringify({
    route, source: f, bodyAttrs, head: headHtml, pre, header: savePartial(hh), mid, footer: savePartial(fh), post,
  }));
  manifest.push({ route, source: f, name });
}

fs.rmSync(PUB, { recursive: true, force: true });
for (const f of files) {
  if (isPage(f) || f.startsWith('analytics/data/') || f.startsWith('info/') || f.endsWith('.db') || f.endsWith('.md')) continue;
  if (f === 'sitemap.xml') continue;
  const dest = path.join(PUB, f);
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  let buf = fs.readFileSync(path.join(SRC, f));
  if (/^llms(-full)?\.txt$/.test(f)) buf = Buffer.from(rewriteAbsInText(buf.toString('utf8')));
  if (f === 'cookie-consent.js') buf = Buffer.from(buf.toString('utf8').replace("_root + 'privacy.html'", "'/privacy'"));
  if (f === 'wizard.js') buf = Buffer.from(buf.toString('utf8').replace('href="nis2-dora-compliance.html"', 'href="/nis2-dora-compliance"'));
  fs.writeFileSync(dest, buf);
}

fs.writeFileSync('src/data/manifest.json', JSON.stringify(manifest, null, 1));
console.log('pages:', pages.length);
for (const k of ['header', 'footer']) {
  console.log(k, 'variants:', hashes[k].size);
  for (const [hash, r] of [...hashes[k]].sort((a, b) => b[1].length - a[1].length).slice(0, 6))
    console.log(' ', hash, r.length, r.slice(0, 3).join(' '));
}
