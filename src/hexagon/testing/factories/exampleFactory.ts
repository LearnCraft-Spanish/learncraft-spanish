import type { ExampleWithVocabulary } from '@learncraft-spanish/shared';
import { exampleWithVocabularySchema } from '@learncraft-spanish/shared';
import { createZodListFactory } from '@testing/utils/factoryTools';

const factory = createZodListFactory(exampleWithVocabularySchema);

export const createMockExampleWithVocabularyList = (
  count?: number,
  overrides?: Partial<ExampleWithVocabulary>,
) => factory(count, overrides);
