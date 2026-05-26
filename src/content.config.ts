import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const aktuality = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/aktuality' }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      date: z.date(),
      author: z.string().default('Farma Kerestúr'),
      cover: image().optional(),
      excerpt: z.string().optional(),
      draft: z.boolean().default(false),
    }),
});

const zvierata = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/zvierata' }),
  schema: ({ image }) =>
    z.object({
      name: z.string(),
      slug: z.string(),
      lead: z.string(),
      heroImage: image(),
      order: z.number().default(99),
    }),
});

const stranky = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/stranky' }),
  schema: z.object({
    title: z.string(),
    description: z.string().optional(),
  }),
});

const galeria = defineCollection({
  loader: glob({ pattern: '**/*.json', base: './src/content/galeria' }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      date: z.date(),
      cover: image(),
      images: z.array(
        z.object({
          src: image(),
          alt: z.string(),
          caption: z.string().optional(),
        })
      ),
    }),
});

export const collections = { aktuality, zvierata, stranky, galeria };
