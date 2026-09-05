import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const published = z.boolean().optional().default(true);

const posts = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './all_collections/_posts' }),
  schema: z.object({
    title: z.string(),
    date: z.coerce.date(),
    categories: z.array(z.string()).optional().default([]),
    tags: z.array(z.string()).optional().default([]),
    published,
  }),
});

const history = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './all_collections/_history' }),
  schema: z.object({
    title: z.string(),
    date: z.coerce.date(),
    published,
  }),
});

const projects = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './all_collections/_projects' }),
  schema: z.object({
    title: z.string(),
    start_date: z.coerce.date().optional(),
    end_date: z.coerce.date().optional(),
    description: z.string().optional().default(''),
    languages: z.array(z.string()).optional().default([]),
    frameworks: z.array(z.string()).optional().default([]),
    images: z.array(z.object({ src: z.string(), alt: z.string() })).optional().default([]),
    links: z.array(z.object({ label: z.string(), url: z.string().url() })).optional().default([]),
    featured: z.boolean().optional().default(false),
    published,
  }),
});

export const collections = { posts, history, projects };
