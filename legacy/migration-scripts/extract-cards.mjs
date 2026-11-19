// One-off: moves hand-written cards from the services, glossary and cities indexes into the
// frontmatter of the pages they link to (`card:`) and replaces the markup with <!--@listing:...--> markers.
import fs from 'node:fs';
import path from 'node:path';
import * as cheerio from 'cheerio';
import YAML from 'yaml';

const ROOT = path.resolve('src/content/pages');
const readPage = (id) => {
  const file = [`${id}.html`, `${id}/index.html`].map((f) => path.join(ROOT, f)).find((f) => fs.existsSync(f));
  if (!file) return null;
  const m = fs.readFileSync(file, 'utf8').match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  return { file, fm: YAML.parse(m[1]), body: m[2] };
};
const writePage = ({ file, fm, body }) =>
  fs.writeFileSync(file, `---\n${YAML.stringify(fm, { lineWidth: 0 })}---\n${body}`);
const idOf = (href) => href.replace(/^\//, '').split('#')[0];
const inner = ($el) => $el.html().replace(/\s+/g, ' ').trim();
const problems = [];

function attach(href, card) {
  const p = readPage(idOf(href));
  if (!p) return problems.push(`no page for ${href}`);
  if (p.fm.card) return problems.push(`duplicate card for ${href}`);
  p.fm.card = card;
  writePage(p);
}

// --- services ---------------------------------------------------------------
const GROUPS = {
  'Основни услуги': 'core',
  'Хостинг и инфраструктура': 'hosting',
  'Приложения като услуга': 'apps',
  'Услуги за бизнес': 'business',
  'Разширена киберсигурност': 'advanced',
  'Регулаторно съответствие': 'compliance',
};
{
  const idx = readPage('services');
  const $ = cheerio.load(idx.body, { decodeEntities: false }, false);
  let order = 0;
  $('section').each((_, sec) => {
    const h2 = $(sec).find('> h2').first().text().trim();
    const group = GROUPS[h2];
    if (!group) return;
    const grid = $(sec).find('> div').first();
    grid.find('> article').each((_, art) => {
      const a = $(art).find('a.btn');
      attach(a.attr('href'), {
        list: 'services', group, order: order++,
        title: inner($(art).find('h3')), text: inner($(art).find('p')), cta: a.text().trim(),
      });
    });
    grid.html(`\n<!--@listing:services:${group}-->\n`);
  });
  idx.body = $.html();
  writePage(idx);
}

// --- glossary ---------------------------------------------------------------
{
  const idx = readPage('resources/glossary');
  const $ = cheerio.load(idx.body, { decodeEntities: false }, false);
  let order = 0;
  const grid = $('.grid.grid-3').first();
  grid.find('> .term-card').each((_, el) => {
    const a = $(el).find('a.term-link');
    attach(a.attr('href'), {
      list: 'glossary', order: order++,
      badge: inner($(el).find('.badge')), title: inner($(el).find('h2')),
      text: inner($(el).find('p')), cta: inner(a),
    });
  });
  grid.html('\n<!--@listing:glossary-->\n');
  idx.body = $.html();
  writePage(idx);
}

// --- cities -----------------------------------------------------------------
{
  const idx = readPage('bulgaria');
  const $ = cheerio.load(idx.body, { decodeEntities: false }, false);
  let order = 0;
  const grid = $('.city-cards').first();
  grid.find('> a.city-card').each((_, el) => {
    attach($(el).attr('href'), {
      list: 'cities', order: order++, title: inner($(el).find('h3')), text: inner($(el).find('p')),
    });
  });
  grid.html('\n<!--@listing:cities-->\n');
  idx.body = $.html();
  writePage(idx);
}

console.log(problems.length ? problems : 'ok');
