import type { z } from 'zod/v4';
import { zocker } from 'zocker';

export function createZodFactory<T>(schema: z.ZodType<T, any, any>) {
  return (): T => ({
    ...zocker(schema).generate(),
  });
}

export function createZodListFactory<T>(
  schema: z.ZodType<T, any, any>,
  defaultLength = 3,
) {
  const createOne = createZodFactory(schema);
  return (count = defaultLength): T[] =>
    Array.from({ length: count }, () => createOne());
}
