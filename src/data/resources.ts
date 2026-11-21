export type ResourceCard = {
  title: string;
  description: string;
  href: string;
  buttonText: string;
};

export type ResourceList = {
  id: string;
  title: string;
  description: string;
  breadcrumb: string;
  cards: ResourceCard[];
};

export const resources: Record<string, ResourceList> = {
  guides: {
    id: 'guides',
    title: 'Практически Ръководства за Киберсигурност',
    description: 'Детайлни технически указания и практически стъпки за защита на мрежи, облачни среди и регулаторно съответствие.',
    breadcrumb: 'Ръководства',
    cards: [
      {
        title: 'Ръководство за NIS2 Подготовка',
        description: 'Стъпка-по-стъпка план за техническа и организационна готовност по Член 21 от директивата NIS2.',
        href: '/blog/nis2-requirements',
        buttonText: 'Прочетете ръководството →',
      },
      {
        title: 'Как Работи SOC Мониторингът?',
        description: 'От прихващане на сигнали и триаж до координирана реакция при инцидент с EDR и SIEM.',
        href: '/blog/how-soc-monitoring-works',
        buttonText: 'Прочетете ръководството →',
      },
      {
        title: 'Внедряване на Zero Trust Архитектура',
        description: 'Поетапен план за интеграция на Zero Trust принципи според NIST SP 800-207 в корпоративна среда.',
        href: '/blog/zero-trust-implementation',
        buttonText: 'Прочетете ръководството →',
      },
    ],
  },
  whitepapers: {
    id: 'whitepapers',
    title: 'Стратегически Whitepapers & Анализи',
    description: 'Задълбочени технически и регулаторни анализи за ръководители на сигурността (CISO), ИТ директори и мениджъри.',
    breadcrumb: 'Whitepapers',
    cards: [
      {
        title: 'Внедряване на Zero Trust в Български Предприятия',
        description: 'Практическо ръководство за преход от периметрова защита към архитекура Zero Trust според NIST SP 800-207.',
        href: '/blog/zero-trust-architecture',
        buttonText: 'Прочетете анализа →',
      },
      {
        title: 'DORA и Устойчивост на ИКТ Доставчиците',
        description: 'Подробен одит на изискванията за управление на трети страни и тестове за проникване (TLPT) за финансовия сектор.',
        href: '/blog/dora-penetration-testing',
        buttonText: 'Прочетете анализа →',
      },
    ],
  },
  reports: {
    id: 'reports',
    title: 'Доклади и Проучвания за Киберсигурност',
    description: 'Официални годишни анализи, изследвания на заплахите и проучвания за нивата на подготвеност на българските компании.',
    breadcrumb: 'Доклади & Проучвания',
    cards: [
      {
        title: 'Състояние на Киберсигурността в Българския Бизнес 2026',
        description: 'Подробен доклад за готовността за NIS2/DORA, честата употреба на EDR и предизвикателствата пред SOC екипите в България.',
        href: '/resources/reports/state-of-cybersecurity-bulgaria-2026',
        buttonText: 'Разгледайте пълния доклад →',
      },
    ],
  },
};
