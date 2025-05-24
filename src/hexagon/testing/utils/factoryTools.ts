import type { z } from 'zod';
import { generateMock } from '@anatine/zod-mock';
import { deriveReadableSeedFromTime } from '@LearnCraft-Spanish/shared';

export function createZodFactory<T>(schema: z.ZodType<T, any, any>) {
  return (overrides: Partial<T> = {}): T => ({
    ...generateMock(schema, {
      seed: deriveReadableSeedFromTime(Date.now()),
    }),
    ...overrides,
  });
}

export function createZodListFactory<T>(
  schema: z.ZodType<T, any, any>,
  defaultLength = 3,
) {
  const createOne = createZodFactory(schema);
  return (count = defaultLength, overrides?: Partial<T>): T[] =>
    Array.from({ length: count }, () => createOne(overrides));
}
