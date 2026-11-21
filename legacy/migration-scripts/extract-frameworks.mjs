import fs from 'node:fs'; import path from 'node:path';
import * as cheerio from 'cheerio'; import YAML from 'yaml';
const dir = 'src/content/pages/compliance';
for (const f of ['cis-controls', 'iso-27017', 'iso-27701', 'nist-csf', 'owasp', 'pci-dss']) {
  const file = path.join(dir, f + '.html');
  const m = fs.readFileSync(file, 'utf8').match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  const fm = YAML.parse(m[1]);
  const $ = cheerio.load(m[2], { decodeEntities: false }, false);
  const hero = $('.page-hero-inner');
  const a = hero.children('a');
  const framework = {
    name: hero.find('nav span[aria-current]').html(), h1: hero.children('h1').html(), lead: hero.children('p').html(),
    cta: { text: a.html(), href: a.attr('href') },
    heading: $('.section-title h2').html(), subtitle: $('.section-title p').html(),
    cards: $('.feature-card').map((_, c) => ({ title: $(c).children('h3').html(), text: $(c).children('p').html() })).get(),
  };
  const out = { ...fm, framework };
  for (const k of ['schema', 'headExtra', 'bodyClass']) delete out[k];
  fs.writeFileSync(file, `---\n${YAML.stringify(out, { lineWidth: 0 })}---\n`);
}
