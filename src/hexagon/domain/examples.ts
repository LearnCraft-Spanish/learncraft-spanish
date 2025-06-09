import type { ApiEndpoint } from '@LearnCraft-Spanish/shared';
import { ExampleRecordSchema } from '@LearnCraft-Spanish/shared';
import { z } from 'zod';

export const getExamplesByFiltersQuerySchema = z.object({
  tags: z.string(),
  course: z.string(),
  toLesson: z.string(),
  fromLesson: z.string(),
});

export const getExamplesByFiltersResponseSchema = z.array(ExampleRecordSchema);

export type getExamplesByFiltersQuery = z.infer<
  typeof getExamplesByFiltersQuerySchema
>;
export type getExamplesByFiltersResponse = z.infer<
  typeof getExamplesByFiltersResponseSchema
>;

// Endpoint
export const getExamplesByFiltersEndpoint = {
  method: 'GET' as const,
  path: '/flashcard-finder/get-examples-by-filters' as const,
  query: getExamplesByFiltersQuerySchema,
  response: getExamplesByFiltersResponseSchema,
} satisfies ApiEndpoint<
  '/flashcard-finder/get-examples-by-filters',
  'GET',
  getExamplesByFiltersQuery,
  unknown,
  unknown,
  getExamplesByFiltersResponse
>;
