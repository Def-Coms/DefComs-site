import type { CollectionEntry } from 'astro:content';

type Author = NonNullable<CollectionEntry<'pages'>['data']['author']>;

export function authorSchema(author: Author) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    '@id': author.url,
    name: author.name,
    jobTitle: author.jobTitle,
    description: author.personDescription,
    affiliation: {
      '@type': 'Organization',
      '@id': 'https://defcoms.eu/#organization',
      name: 'DefComs',
    },
    image: author.image,
    url: author.url,
    ...(author.sameAs ? { sameAs: author.sameAs } : {}),
    knowsAbout: author.knowsAbout,
  };
}
