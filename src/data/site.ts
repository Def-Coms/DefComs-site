export const site = {
  name: 'DefComs',
  url: 'https://defcoms.eu',
  locale: 'bg_BG',
  lang: 'bg',
  defaultImage: 'https://defcoms.eu/images/PR_image/Киберсигурността__Щит_на_модерния_бизнес.webp',
  logo: '/images/Logos/DefComs-logo.svg',
  year: 2026,
};

export interface NavItem {
  label: string;
  href: string;
}

// Main navigation. Add an item here and it appears on every page.
export const nav: NavItem[] = [
  { label: 'Начало', href: '/' },
  { label: 'За нас', href: '/about' },
  { label: 'Услуги', href: '/services' },
  { label: 'Регулации', href: '/compliance' },
  { label: 'Cybersecurity OS', href: '/cybersecurity-os' },
  { label: 'NIS2 & DORA Оценка', href: '/wizard' },
  { label: 'Справочник', href: '/spravochnik' },
  { label: 'Блог', href: '/blog' },
  { label: 'Контакти', href: '/contact' },
];

export const navCta = { label: 'Свържете се с нас', href: '/contact' };

export const social = [
  { label: 'YouTube', href: 'https://www.youtube.com/@DefComs' },
  { label: 'Facebook', href: 'https://www.facebook.com/profile.php?id=61590374520528' },
];
export const footer = {
  about:
    'Вашият високотехнологичен партньор в киберсигурността. Предотвратяване, засичане и бърза неутрализация на съвременните заплахи.',
  columns: [
    {
      title: 'Услуги',
      links: [
        { label: 'SOC Мониторинг 24/7', href: '/services/soc-monitoring' },
        { label: 'NOC Управление', href: '/services/noc-services' },
        { label: 'Обучения за фирми', href: '/services/corporate-training' },
        { label: 'Penetration Testing', href: '/services/penetration-testing' },
        { label: 'GDPR/NIS2/DORA Съответствие', href: '/compliance/nis2' },
        { label: 'Управление на уязвимости', href: '/services/vulnerability-management' },
      ],
    },
    {
      title: 'Ресурси',
      links: [
        { label: 'Регулаторен Хъб', href: '/spravochnik' },
        { label: 'Cybersecurity OS', href: '/cybersecurity-os' },
        { label: 'ShieldAcademy', href: '/shield-academy' },
        { label: 'Статии & Блог', href: '/blog' },
        { label: 'За Нас', href: '/about' },
        { label: 'Покритие в България', href: '/bulgaria' },
      ],
    },
    {
      title: 'Правна рамка',
      links: [
        { label: 'Регулация NIS2', href: '/compliance/nis2' },
        { label: 'Регламент GDPR', href: '/compliance/gdpr' },
        { label: 'Стандарт ISO 27001', href: '/compliance/iso-27001' },
        { label: 'DORA съответствие', href: '/compliance/dora' },
        { label: 'NIST CSF', href: '/compliance/nist-csf' },
        { label: 'Контакти', href: '/#contact' },
      ],
    },
  ],
  legal: [
    { label: 'Условия за ползване', href: '/terms' },
    { label: 'Защита на данни', href: '/privacy' },
  ],
};
