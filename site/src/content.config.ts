import { defineCollection } from 'astro:content';
import { z } from 'astro/zod';
import { contentSlots } from './data/content';

const slots = defineCollection({
  loader: async () => contentSlots.map(slot => ({ ...slot })),
  schema: z.object({
    title: z.string().min(1),
    section: z.string().min(1),
    request: z.string().min(1),
    note: z.string().min(1),
    checklist: z.array(z.string().min(1)).min(1),
    status: z.enum(['Needs content', 'Received: checking', 'Needs an update', 'Ready', 'Not needed']),
    required: z.boolean(),
    requirement: z.enum(['required', 'optional', 'conditional']),
    publicationDecision: z.enum(['retain', 'omit', 'undecided']),
    omissionReason: z.string().nullable(),
  }),
});
// Review-only guidance stays out of the public content cache and export.
export const collections = process.env.PUBLIC_SITE_MODE === 'public' || process.env.PUBLIC_SITE_MODE === 'fixture' ? {} : { slots };
