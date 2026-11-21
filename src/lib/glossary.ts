export function termMeta(term: { name: string; short: string }, id: string, description: string) {
  const url = `https://defcoms.eu/${id}`;
  return {
    schema: [
      {
        '@context': 'https://schema.org',
        '@type': 'DefinedTerm',
        name: term.name,
        description,
        inLanguage: 'bg',
        url,
        isPartOf: { '@type': 'DefinedTermSet', name: 'Речник по киберсигурност', url: 'https://defcoms.eu/resources/glossary' },
      },
      {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Начало', item: 'https://defcoms.eu/' },
          { '@type': 'ListItem', position: 2, name: 'Речник', item: 'https://defcoms.eu/resources/glossary' },
          { '@type': 'ListItem', position: 3, name: term.short, item: url },
        ],
      },
    ],
  };
}
