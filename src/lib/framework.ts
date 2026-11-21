// Compliance framework page (CIS, NIST, OWASP, PCI DSS, ISO 27017/27701): hero + grid of cards
export interface Framework {
  name: string; // last breadcrumb item
  h1: string;
  lead: string;
  cta: { text: string; href: string };
  heading: string;
  subtitle: string;
  cardMin?: number; // min card width in px (default 300)
  cards: { title: string; text: string }[];
}

export function frameworkMeta(f: Framework, id: string, title: string, description: string) {
  const url = `https://defcoms.eu/${id}`;
  return {
    bodyClass: 'service-landing',
    headExtra: FRAMEWORK_CSS.replace('300px', `${f.cardMin ?? 300}px`),
    schema: [{
      '@context': 'https://schema.org',
      '@graph': [
        { '@type': 'WebPage', '@id': `${url}#webpage`, url, name: title, description, inLanguage: 'bg-BG', isPartOf: { '@id': 'https://defcoms.eu/#website' }, publisher: { '@id': 'https://defcoms.eu/#organization' }, about: { '@id': 'https://defcoms.eu/#organization' } },
        { '@type': 'BreadcrumbList', itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'DefComs', item: 'https://defcoms.eu/' },
          { '@type': 'ListItem', position: 2, name: title.split(' | ')[0], item: url },
        ] },
      ],
    }],
  };
}

export const FRAMEWORK_CSS = `<style>
        .page-hero {
            padding: 160px 24px 80px;
            background: radial-gradient(circle at 50% 20%, rgba(0, 240, 255, 0.12) 0%, transparent 60%),
                        radial-gradient(circle at 80% 80%, rgba(0, 102, 255, 0.1) 0%, transparent 50%),
                        var(--background-dark);
            text-align: center;
        }
        .page-hero-inner { max-width: 900px; margin: 0 auto; }
        .page-hero h1 { font-size: clamp(2.3rem, 4.5vw, 3.6rem); margin-bottom: 20px; line-height: 1.15; }
        .page-hero p { font-size: 1.18rem; color: var(--text-secondary); line-height: 1.7; margin-bottom: 30px; }
        .grid-section { padding: 80px 24px; max-width: 1200px; margin: 0 auto; }
        .cards-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 30px; margin-top: 40px; }
        .feature-card {
            background: var(--background-card);
            border: 1px solid var(--border-color);
            border-radius: var(--radius-lg);
            padding: 32px;
            transition: transform 0.3s ease, border-color 0.3s ease;
        }
        .feature-card:hover { transform: translateY(-5px); border-color: var(--primary-cyan); }
        .feature-card h3 { font-size: 1.3rem; color: var(--text-primary); margin-bottom: 14px; }
        .feature-card p { color: var(--text-secondary); line-height: 1.65; font-size: 0.98rem; }
    </style>`;
