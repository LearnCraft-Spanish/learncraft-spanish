import { exampleWithVocabularySchema } from '@learncraft-spanish/shared';
import { createZodListFactory } from '@testing/utils/factoryTools';

export const createMockExampleWithVocabularyList = (count?: number) =>
  createZodListFactory(exampleWithVocabularySchema, count);
