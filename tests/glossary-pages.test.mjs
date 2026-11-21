import { readdirSync, readFileSync } from 'node:fs';
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { load } from 'cheerio';
import YAML from 'yaml';

const directory = 'src/content/pages/resources/glossary';
const files = readdirSync(directory).filter((file) => file.endsWith('.html') && file !== 'index.html');
const index = load(readFileSync('dist/resources/glossary.html', 'utf8'));

for (const file of files) {
  test(`${file}: glossary page, index card and structured data agree`, () => {
    const slug = file.slice(0, -5);
    const source = readFileSync(`${directory}/${file}`, 'utf8');
    const data = YAML.parse(source.split('---\n')[1]);
    if (data.draft) return;
    const { term } = data;
    assert.ok(term, `Missing term data in ${file}`);
    const $ = load(readFileSync(`dist/resources/glossary/${file}`, 'utf8'));
    const schemas = $('script[type="application/ld+json"]').toArray()
      .map((script) => JSON.parse($(script).text()));
    const defined = schemas.find((item) => item['@type'] === 'DefinedTerm');
    const breadcrumb = schemas.find((item) => item['@type'] === 'BreadcrumbList');
    const url = `https://defcoms.eu/resources/glossary/${slug}`;
    assert.equal($('main h1').text(), term.name);
    assert.equal(defined.name, term.name);
    assert.equal(defined.description, data.description);
    assert.equal(defined.url, url);
    assert.equal(breadcrumb.itemListElement[2].name, term.short);
    assert.equal(breadcrumb.itemListElement[2].item, url);
    const card = index(`.term-card a[href="/resources/glossary/${slug}"]`).closest('.term-card');
    assert.equal(card.length, 1);
    assert.equal(card.find('.badge').text(), term.badge);
    assert.equal($('main .hero-container .badge').text(), term.badge);
    const lists = $('main article.term-card > ul');
    assert.equal(lists.eq(0).children('li').length, term.risks.length);
    assert.equal(lists.eq(1).children('li').length, term.practices.length);
    for (const [position, links] of [[2, term.related], [3, term.sources]]) {
      const anchors = lists.eq(position).find('a');
      assert.equal(anchors.length, links.length);
      links.forEach((link, i) => {
        assert.equal(anchors.eq(i).attr('href'), link.href);
        assert.equal(anchors.eq(i).attr('target'), link.external ? '_blank' : undefined);
        assert.equal(anchors.eq(i).attr('rel'), link.external ? 'noopener' : undefined);
      });
    }
  });
}
