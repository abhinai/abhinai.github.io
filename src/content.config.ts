import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const blog = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/blog' }),
  schema: z.object({
    title: z.string(),
    // Keep the timestamp exactly as written: its YYYY-MM-DD is the date the original site displayed
    date: z.union([z.string(), z.date()]),
    category: z.string(),
    description: z.string().optional(),
    cover: z.string().optional(),
    // Photos: the 4:3 crop shown on the Photos page (made in the CMS), and that crop as "left top width"
    thumb: z.string().optional(),
    crop: z.string().optional(),
    featured: z.boolean().default(false),
    // Listing order: higher weight first, then newest first
    weight: z.number().default(1),
    draft: z.boolean().default(false),
    source: z.string().optional(),
    sourceName: z.string().optional(),
  }).transform((d) => {
    const iso = typeof d.date === 'string' ? d.date : d.date.toISOString();
    return { ...d, date: new Date(iso), day: iso.slice(0, 10), published: iso };
  }),
});

const pages = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/pages' }),
  schema: z.object({
    title: z.string(),
    description: z.string().optional(),
    // Optional portrait shown beside the opening paragraphs (also the page's share image)
    image: z.string().optional(),
    imageAlt: z.string().optional(),
  }),
});

export const collections = { blog, pages };
