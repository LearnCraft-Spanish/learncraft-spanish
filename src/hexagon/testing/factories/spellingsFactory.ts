import { z } from 'zod';
import { faker } from '@faker-js/faker';

const spellingsDataSchema = z.array(z.string());

export const createMockSpellingsData = (count: number) => {
  return spellingsDataSchema.parse(
    Array.from({ length: count }, () => faker.word.adjective()),
  );
};
