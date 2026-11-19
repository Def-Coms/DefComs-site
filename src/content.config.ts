import { defineCollection, z } from 'astro:content';
import { pagesLoader } from './loaders/pages';

const pages = defineCollection({
  loader: pagesLoader({ base: 'src/content/pages' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
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
  }),
});

export const collections = { pages };
