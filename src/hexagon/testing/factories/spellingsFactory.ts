import { faker } from '@faker-js/faker';
import { z } from 'zod/v4';

const spellingsDataSchema = z.array(z.string());

export const createMockSpellingsData = (count: number) => {
  return spellingsDataSchema.parse(
    Array.from({ length: count }, () => faker.word.adjective()),
  );
};
