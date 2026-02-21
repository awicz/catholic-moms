import { z } from 'zod';

export const bookSchema = z.object({
  title: z.string().min(1, 'Book title is required').max(200),
  author: z.string().min(1, 'Author name is required').max(200),
  purchaseUrl: z
    .string()
    .url('Please enter a valid URL (e.g. https://...)')
    .optional()
    .or(z.literal('')),
  whyHelpful: z.string().max(100, 'Please keep this to 100 characters or less').optional(),
  categoryIds: z
    .array(z.coerce.number())
    .min(1, 'Please select at least one category'),
});

export type BookInput = z.infer<typeof bookSchema>;
