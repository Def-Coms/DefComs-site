import fs from 'node:fs'; import path from 'node:path';
import * as cheerio from 'cheerio'; import YAML from 'yaml';
const dir = 'src/content/pages/bulgaria';
const norm = (s) => s.replace(/\s+/g, ' ').trim();
for (const f of fs.readdirSync(dir)) {
  if (f === 'index.html') continue;
  const file = path.join(dir, f);
  const m = fs.readFileSync(file, 'utf8').match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  const fm = YAML.parse(m[1]);
  const $ = cheerio.load(m[2], { decodeEntities: false }, false);
  const sec = $('main section');
  const city = {
    name: fm.card.title,
    region: norm($('.service-landing-kicker').first().html()),
    lead: norm($('.service-landing-lead').html()),
    risks: $(sec[1]).find('li').map((_, li) => ({ title: norm($(li).find('strong').text()).replace(/:$/, ''), text: norm($(li).html().replace(/^<strong>[\s\S]*?<\/strong>\s*/, '')) })).get(),
    others: $('p[style*="Други градове"] a').map((_, a) => $(a).attr('href')).get().filter((h) => h !== '/bulgaria').map((h) => h.split('/').pop()),
  };
  const out = { lastmod: fm.lastmod, priority: fm.priority, city, card: { list: 'cities', order: fm.card.order } };
  fs.writeFileSync(file, `---\n${YAML.stringify(out, { lineWidth: 0 })}---\n`);
}
