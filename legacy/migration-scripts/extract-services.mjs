import fs from 'node:fs'; import path from 'node:path';
import * as cheerio from 'cheerio'; import YAML from 'yaml';
const dir = 'src/content/pages/services';
const report = { ok: [], skipped: [] };
const sideSchemas = {};
for (const f of fs.readdirSync(dir)) {
  if (f === 'index.html') continue;
  const file = path.join(dir, f);
  const m = fs.readFileSync(file, 'utf8').match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  const fm = YAML.parse(m[1]);
  const $ = cheerio.load(m[2], { decodeEntities: false }, false);
  const fail = (why) => report.skipped.push(`${f}: ${why}`);
  try {
    const main = $('main').first();
    const secs = main.children('section').toArray().map((e) => $(e));
    if (!secs.length || main.children().length !== secs.length) throw new Error('main has non-section children');
    const hero = secs[0];
    if (!hero.hasClass('service-landing-hero')) throw new Error('first section is not hero');
    const grid = hero.children('div.container.service-landing-grid');
    const [left, visual] = grid.children('div').toArray().map((e) => $(e));
    if (grid.children().length !== 2 || !visual.hasClass('service-landing-visual')) throw new Error('hero shape');
    const crumbs = left.children('nav'); const lk = left.children().toArray().map((e) => e.tagName + '.' + ($(e).attr('class') || ''));
    const rest = 'p.service-landing-kicker,h1.,p.service-landing-lead,div.service-landing-actions';
    if (lk.join() !== 'nav.blog-breadcrumbs,' + rest && lk.join() !== rest) throw new Error('hero left: ' + lk.join());
    const hasCrumb = crumbs.length > 0;
    const acts = left.find('.service-landing-actions a').toArray().map((a) => ({ text: $(a).html(), href: $(a).attr('href'), cls: $(a).attr('class') }));
    if (acts.length !== 2 || acts[0].cls !== 'btn btn-primary' || acts[1].cls !== 'btn btn-secondary') throw new Error('actions');
    const img = visual.children('img');
    const vk = visual.children().toArray().map((e) => e.tagName + '.' + ($(e).attr('class') || ''));
    if (vk.join() !== 'img.,div.service-landing-nodes') throw new Error('visual: ' + vk.join());
    const ia = Object.keys(img[0].attribs).sort().join();
    const sized = ia === 'alt,fetchpriority,height,src,width';
    if (!sized && ia !== 'alt,src') throw new Error('img attrs ' + ia);
    const nodes = visual.find('.service-landing-node').toArray().map((n) => ({ title: $(n).children('strong').html(), text: $(n).html().replace(/^<strong>[\s\S]*?<\/strong>/, '') }));
    const sections = secs.slice(1).map((s) => {
      const cls = s.attr('class');
      const kids = s.children();
      const cont = kids.length === 1 && kids.is('div') ? kids.first() : null;
      const alt = cls === 'service-landing-section alt';
      if (!cont || !(cls === 'service-landing-section' || alt)) return { type: 'html', html: $.html(s) };
      const ck = cont.children().toArray().map((e) => e.tagName + '.' + ($(e).attr('class') || ''));
      const isFaq = cont.hasClass('service-landing-faq') && ck.length >= 3 && ck[0] === 'p.service-landing-kicker' && ck[1] === 'h2.' && ck.slice(2).every((k) => k === 'details.');
      const base = { ...(alt ? { alt: true } : {}) };
      if (isFaq) {
        return { type: 'faq', ...base, kicker: cont.children('p').first().html(), title: cont.children('h2').html(),
          items: cont.children('details').toArray().map((d) => ({ q: $(d).children('summary').html(), a: $(d).children('p').html(), ...($(d).attr('open') !== undefined ? { open: true } : {}) })) };
      }
      if (cont.attr('class') === 'container' && ck[0] === 'p.service-landing-kicker' && ck[1] === 'h2.') {
        const rest = cont.children().toArray().slice(2).map((e) => $.html(e)).join('');
        return { type: 'content', ...base, kicker: cont.children('p').first().html(), title: cont.children('h2').html(), body: rest };
      }
      return { type: 'html', html: $.html(s) };
    });
    const old = (fm.schema?.[0]?.['@graph'] ?? []);
    const svc = old.find((n) => n['@type'] === 'Service') ?? {};
    const name = left.children('h1').html();
    const short = crumbs.length ? crumbs.children('span').html() : undefined;
    sideSchemas[f] = fm.schema;
    const service = {
      name, ...(short && short !== name ? { short } : {}), ...(svc.name && svc.name !== (short ?? name) ? { schemaName: svc.name } : {}), category: left.children('p.service-landing-kicker').html(), lead: left.children('p.service-landing-lead').html(),
      actions: acts.map(({ text, href }) => ({ text, href })),
      image: { src: img.attr('src'), alt: img.attr('alt'), ...(sized ? { width: +img.attr('width'), height: +img.attr('height') } : {}) },
      ...(hasCrumb ? {} : { breadcrumb: false }),
      nodes, serviceType: svc.serviceType, summary: svc.description, sections,
    };
    const out = { ...fm, service };
    if (hasCrumb) delete out.schema;
    if (sized && out.headExtra === `<link rel="preload" as="image" href="${service.image.src}" fetchpriority="high">`) delete out.headExtra;
    fs.writeFileSync(file, `---\n${YAML.stringify(out, { lineWidth: 0 })}---\n`);
    report.ok.push(f);
  } catch (e) { fail(e.message); }
}
fs.writeFileSync('/tmp/old-schemas.json', JSON.stringify(sideSchemas));
console.log(report.ok.length, 'migrated'); console.log(report.skipped.join('\n'));
