import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { load } from 'cheerio';
import YAML from 'yaml';

function profile(group, slug) {
  const source = readFileSync(`src/content/pages/about/${group}/${slug}.html`, 'utf8');
  const data = YAML.parse(source.split('---\n')[1]);
  const $ = load(readFileSync(`dist/about/${group}/${slug}.html`, 'utf8'));
  const person = $('script[type="application/ld+json"]').toArray()
    .map((script) => JSON.parse($(script).text()))
    .find((schema) => schema['@type'] === 'Person');
  return { data, $, person };
}

for (const slug of ['alexander-petrov', 'elena-dimitrova']) {
  for (const group of ['author', 'team/author']) {
    test(`${group}/${slug}: profile variants render their content and Person data`, () => {
      const { data, $, person } = profile(group, slug);
      const author = data.author;
      const full = group === 'team/author';
      assert.equal($('link[rel="canonical"]').attr('href'), author.url);
      assert.deepEqual(person, {
        '@context': 'https://schema.org',
        '@type': 'Person',
        '@id': author.url,
        name: author.name,
        jobTitle: author.jobTitle,
        description: author.personDescription,
        affiliation: { '@type': 'Organization', '@id': 'https://defcoms.eu/#organization', name: 'DefComs' },
        image: author.image,
        url: author.url,
        ...(author.sameAs ? { sameAs: author.sameAs } : {}),
        knowsAbout: author.knowsAbout,
      });
      assert.equal($('main h1').text(), author.name);
      assert.equal($('.service-landing-lead').html(), author.lead);
      assert.equal($('main section').eq(1).find('p').eq(0).html(), author.bio);
      assert.deepEqual($('main section').eq(1).find('li').toArray().map((el) => $(el).html()), author.expertise);
      assert.equal($('.service-landing-visual img').length, full ? 0 : 1);
      if (!full) assert.equal($('.service-landing-visual img').attr('src'), new URL(author.image).pathname);
      assert.equal($('.cert-card').length, full ? 5 : 0);
      assert.deepEqual($('.article-card').toArray().map((el) => ({
        category: $(el).find('.article-category').html(),
        title: $(el).find('h3').html(),
        href: $(el).find('a').attr('href'),
      })), author.articles);
      assert.equal($('.article-card.show').length, full ? author.articles.length : 0);
    });
  }
}

test('short and full profiles keep their distinct descriptions and article lists', () => {
  const short = profile('author', 'elena-dimitrova');
  const full = profile('team/author', 'elena-dimitrova');
  assert.notEqual(short.person.description, full.person.description);
  assert.notEqual(short.$('.service-landing-lead').text(), full.$('.service-landing-lead').text());
  assert.equal(short.$('.article-card').length, 1);
  assert.equal(full.$('.article-card').length, 22);
});
