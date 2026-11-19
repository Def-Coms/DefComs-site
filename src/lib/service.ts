export interface ServiceBlock {
  type: 'content' | 'faq' | 'html';
  alt?: boolean;
  kicker?: string;
  title?: string;
  body?: string;
  html?: string;
  items?: { q: string; a: string; open?: boolean }[];
}

export interface Service {
  name: string;
  // Shorter name for breadcrumb and JSON-LD when it differs from the H1
  short?: string;
  // Service name in JSON-LD when it differs from `short`/`name`
  schemaName?: string;
  category: string;
  lead: string;
  actions: { text: string; href: string }[];
  // With width/height the image is the LCP image (fetchpriority + preload); without them it is a plain image
  image: { src: string; alt: string; width?: number; height?: number };
  // false: no breadcrumb in the hero (legacy variant; its JSON-LD stays explicit in frontmatter)
  breadcrumb?: boolean;
  nodes: { title: string; text: string }[];
  serviceType?: string;
  summary?: string;
  sections: ServiceBlock[];
}

const plain = (s: string) =>
  s.replace(/<[^>]+>/g, '').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'");

// JSON-LD (Service, WebPage, BreadcrumbList, FAQPage) derived from the service record
export function serviceMeta(s: Service, id: string, title: string) {
  const url = `https://defcoms.eu/${id}`;
  const name = plain(s.short ?? s.name);
  const svcName = s.schemaName ? plain(s.schemaName) : name;
  const faq = s.sections.filter((b) => b.type === 'faq').flatMap((b) => b.items ?? []);
  const graph: Record<string, unknown>[] = [
    { '@type': 'Organization', '@id': 'https://defcoms.eu/#organization', name: 'DefComs', url: 'https://defcoms.eu/' },
    { '@type': 'WebPage', '@id': `${url}#webpage`, url, name: title, inLanguage: 'bg', isPartOf: { '@id': 'https://defcoms.eu/#website' }, breadcrumb: { '@id': `${url}#breadcrumb` }, publisher: { '@id': 'https://defcoms.eu/#organization' } },
    { '@type': 'Service', '@id': `${url}#service`, name: svcName, ...(s.serviceType ? { serviceType: s.serviceType } : {}), url, provider: { '@id': 'https://defcoms.eu/#organization' }, areaServed: { '@type': 'Country', name: 'Bulgaria' }, ...(s.summary ? { description: s.summary } : {}) },
    { '@type': 'BreadcrumbList', '@id': `${url}#breadcrumb`, itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Начало', item: 'https://defcoms.eu/' },
      { '@type': 'ListItem', position: 2, name: 'Услуги', item: 'https://defcoms.eu/services' },
      { '@type': 'ListItem', position: 3, name, item: url },
    ] },
  ];
  if (faq.length) graph.push({ '@type': 'FAQPage', mainEntity: faq.map((i) => ({ '@type': 'Question', name: plain(i.q), acceptedAnswer: { '@type': 'Answer', text: plain(i.a) } })) });
  return {
    schema: [{ '@context': 'https://schema.org', '@graph': graph }],
    ...(s.image.width ? { headExtra: `<link rel="preload" as="image" href="${s.image.src}" fetchpriority="high">` } : {}),
  };
}
