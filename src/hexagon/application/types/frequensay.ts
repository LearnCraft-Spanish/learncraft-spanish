import { z } from 'zod';

export const WordCountSchema = z.object({
  word: z.string().min(1),
  count: z.number().int().positive(),
});

export type WordCount = z.infer<typeof WordCountSchema>;
