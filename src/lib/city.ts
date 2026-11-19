export interface City {
  name: string;
  region: string;
  lead: string;
  risks: { title: string; text: string }[];
  others: string[];
  loc?: string;
}

// "в София", "във Варна"
export const inCity = (c: City) => c.loc ?? `${/^[вф]/i.test(c.name) ? 'във' : 'в'} ${c.name}`;

export const cityCardText = (c: City) => `${c.region}. Киберсигурност, SOC/NOC, NIS2 и DORA за фирми ${inCity(c)}.`;

const ROBOTS = 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1';

export function faq(c: City) {
  const w = inCity(c);
  return [
    [`Предлага ли DefComs услуги ${w}?`, `Да. SOC и NOC услугите се предоставят дистанционно 24/7 за организации ${w} и в цяла България, а на място работим по предварителна заявка.`],
    [`Задължен ли е бизнесът ${w} да спазва NIS2?`, 'Зависи от сектора и размера на организацията, а не от града. Средни и големи субекти в над 18 сектора (енергетика, транспорт, здравеопазване, ИКТ услуги, производство, храни и др.) са в обхвата. Самооценката ни показва къде сте.'],
    [`Колко бързо реагирате при инцидент ${w}?`, 'Дежурните ни анализатори следят средата непрекъснато. При потвърден инцидент започваме изолиране и анализ веднага след уведомяване; конкретните срокове се договарят в SLA.'],
  ];
}

// Head data derived from the city record: title, description, meta and JSON-LD
export function cityMeta(c: City, id: string) {
  const w = inCity(c);
  const url = `https://defcoms.eu/${id}`;
  const title = `Киберсигурност ${w} | SOC, NOC, NIS2 и DORA | DefComs`;
  const ogTitle = `Киберсигурност ${w} | SOC, NOC, NIS2 и DORA за бизнеса | DefComs`;
  const description = `Киберсигурност за фирми ${w}: SOC мониторинг 24/7, NOC, тестове за проникване, NIS2/DORA съответствие и обучения. Дистанционно и на място по заявка.`;
  return {
    title, ogTitle, description, robots: ROBOTS, bodyClass: 'service-landing',
    meta: { author: 'DefComs', 'geo.region': 'BG', 'geo.placename': c.name, 'theme-color': '#050811', 'color-scheme': 'dark' },
    schema: [{
      '@context': 'https://schema.org',
      '@graph': [
        { '@type': 'WebPage', '@id': `${url}#webpage`, url, name: ogTitle, description, inLanguage: 'bg-BG', isPartOf: { '@id': 'https://defcoms.eu/#website' }, about: { '@id': 'https://defcoms.eu/#organization' } },
        { '@type': 'Service', '@id': `${url}#service`, name: `Услуги по киберсигурност ${w}`, serviceType: 'Cybersecurity services', provider: { '@id': 'https://defcoms.eu/#organization' }, areaServed: { '@type': 'City', name: c.name, containedInPlace: { '@type': 'Country', name: 'Bulgaria' } }, availableChannel: { '@type': 'ServiceChannel', serviceUrl: url } },
        { '@type': 'BreadcrumbList', itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'DefComs', item: 'https://defcoms.eu/' },
          { '@type': 'ListItem', position: 2, name: 'Покритие в България', item: 'https://defcoms.eu/bulgaria' },
          { '@type': 'ListItem', position: 3, name: c.name, item: url },
        ] },
        { '@type': 'FAQPage', mainEntity: faq(c).map(([q, a]) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } })) },
      ],
    }],
  };
}
