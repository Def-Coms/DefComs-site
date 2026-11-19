import { defineCollection, z } from 'astro:content';
import { pagesLoader } from './loaders/pages';

const cardSchema = z.object({
  list: z.enum(['services', 'glossary', 'cities']),
  group: z.string().optional(),
  order: z.number().default(0),
  title: z.string(),
  text: z.string(),
  badge: z.string().optional(),
  cta: z.string().optional(),
});

const pages = defineCollection({
  loader: pagesLoader({ base: 'src/content/pages' }),
  schema: z.object({
    // Generated from `city` for city pages
    title: z.string().default(''),
    description: z.string().default(''),
    robots: z.string().optional(),
    // Only set when the canonical URL differs from the page URL
    canonical: z.string().url().optional(),
    ogType: z.string().optional(),
    ogTitle: z.string().optional(),
    ogDescription: z.string().optional(),
    twitterTitle: z.string().optional(),
    twitterDescription: z.string().optional(),
    image: z.string().optional(),
    imageAlt: z.string().optional(),
    // Extra <meta name="..."> tags (author, theme-color, geo.*, ...)
    meta: z.record(z.string()).optional(),
    // JSON-LD objects
    schema: z.array(z.record(z.any())).optional(),
    // Raw HTML appended to <head> (preload, page-specific <style>, ...)
    headExtra: z.string().optional(),
    bodyClass: z.string().optional(),
    bodyAttrs: z.record(z.string()).optional(),
    // Page-specific scripts, e.g. /wizard.js
    scripts: z.array(z.string()).optional(),
    // "bare" = no header/footer/shared scripts (e.g. 404)
    layout: z.enum(['default', 'bare']).default('default'),
    // Sitemap
    lastmod: z.coerce.date().optional(),
    changefreq: z.string().optional(),
    priority: z.number().optional(),
    draft: z.boolean().default(false),
    // City landing page: the whole page (head, JSON-LD, body) is generated from this record
    city: z
      .object({
        name: z.string(),
        region: z.string(),
        lead: z.string(),
        risks: z.array(z.object({ title: z.string(), text: z.string() })),
        others: z.array(z.string()).default([]),
        loc: z.string().optional(),
      })
      .optional(),
    // Card(s) shown on generated indexes (services, glossary, cities); an array when a page is listed in several
    card: z
      .union([cardSchema, z.array(cardSchema)])
      .optional(),
    // Blog article card (used by the generated blog archive)
    blog: z
      .object({
        categories: z.array(z.string()),
        date: z.coerce.date(),
        order: z.number().default(0),
        title: z.string(),
        summary: z.string(),
        image: z.string(),
        imageAlt: z.string(),
        imageWidth: z.number().default(1200),
        imageHeight: z.number().default(675),
        ariaLabel: z.string().optional(),
        cta: z.string().default('Прочетете ръководството →'),
      })
      .optional(),
    // Markdown blog post: rendered with the standard article layout, card and JSON-LD are derived
    article: z
      .object({
        categories: z.array(z.string()),
        kicker: z.string().optional(),
        deck: z.string().optional(),
        breadcrumb: z.string().optional(),
        author: z.object({ name: z.string(), href: z.string() }),
        published: z.coerce.date(),
        updated: z.coerce.date().optional(),
        image: z.string(),
        imageAlt: z.string(),
        related: z.array(z.object({ label: z.string(), href: z.string() })).default([]),
        cta: z.object({ title: z.string(), text: z.string(), label: z.string(), href: z.string() }).optional(),
      })
      .optional(),
    // Replaces the <!--@listing--> marker in the body with a generated list
    listing: z.enum(['blog']).optional(),
  }),
});

export const collections = { pages };
