import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { load } from 'cheerio';

const services = [
  'backup-disaster-recovery', 'cloud-security', 'corporate-training',
  'edr-xdr', 'incident-response', 'noc-services', 'penetration-testing',
  'phishing-simulation', 'ransomware-protection', 'supply-chain-security',
  'zero-trust',
];

function page(slug) {
  const $ = load(readFileSync(`dist/services/${slug}.html`, 'utf8'));
  const schema = $('script[type="application/ld+json"]').toArray()
    .map((script) => JSON.parse($(script).text()))
    .flatMap((data) => data['@graph'] ?? [data]);
  return { $, schema };
}

function checkFaq($, schema, selector) {
  const visible = $(selector).toArray().map((element) => ({
    question: $(element).find('summary').text().trim(),
    answer: $(element).find('p').text().trim(),
  }));
  const faq = schema.filter((item) => item['@type'] === 'FAQPage');
  if (!visible.length) {
    assert.equal(faq.length, 0);
    return;
  }
  assert.equal(faq.length, 1);
  assert.deepEqual(faq[0].mainEntity.map((item) => ({
    question: item.name,
    answer: item.acceptedAnswer.text,
  })), visible);
}

test('SOC FAQ structured data matches the visible questions and answers', () => {
  const { $, schema } = page('soc-monitoring');
  assert.equal($('main details').length, 4);
  checkFaq($, schema, 'main details');
});

for (const slug of services) {
  test(`${slug} has matching breadcrumbs, image and structured data`, () => {
    const { $, schema } = page(slug);
    const breadcrumb = $('main nav.blog-breadcrumbs');
    assert.equal(breadcrumb.length, 1);
    assert.equal(breadcrumb.find('a').eq(1).attr('href'), '/services');
    const structured = schema.find((item) => item['@type'] === 'BreadcrumbList');
    assert.equal(structured.itemListElement[1].item, 'https://defcoms.eu/services');
    assert.equal(structured.itemListElement[2].name, breadcrumb.find('span').text().trim());
    assert.equal(structured.itemListElement[2].item, `https://defcoms.eu/services/${slug}`);
    assert.equal(schema.find((item) => item['@type'] === 'Service')?.url, `https://defcoms.eu/services/${slug}`);
    const image = $('main .service-landing-visual img');
    assert.ok(Number(image.attr('width')) > 0);
    assert.ok(Number(image.attr('height')) > 0);
    assert.equal($('link[rel="preload"][as="image"]').attr('href'), image.attr('src'));
    checkFaq($, schema, 'main .service-landing-faq details');
  });
}
