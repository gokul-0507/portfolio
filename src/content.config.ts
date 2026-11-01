import { defineCollection } from 'astro:content';
import { z } from 'astro/zod';
import { glob } from 'astro/loaders';

const projects = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/projects' }),
  schema: z.object({
    title: z.string(),
    index: z.string(),
    category: z.string(),
    status: z.string(),
    statusType: z.enum(['in-progress', 'proposal', 'prototype']),
    summary: z.string(),
    topics: z.array(z.string()),
    repoUrl: z.string().optional(),
    architectureLabel: z.string(),
  }),
});

export const collections = { projects };
