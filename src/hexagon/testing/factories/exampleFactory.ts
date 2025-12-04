import type {
  ExampleTechnical,
  ExampleWithVocabulary,
} from '@learncraft-spanish/shared';
import {
  exampleTechnicalSchema,
  exampleWithVocabularySchema,
} from '@learncraft-spanish/shared';
import { createZodListFactory } from '@testing/utils/factoryTools';

const factory = createZodListFactory(exampleWithVocabularySchema);
const technicalFactory = createZodListFactory(exampleTechnicalSchema);

export const createMockExampleWithVocabularyList = (
  count?: number,
  overrides?: Partial<ExampleWithVocabulary>,
) => factory(count, overrides);

export const createMockExampleTechnicalList = (
  count?: number,
  overrides?: Partial<ExampleTechnical>,
) => technicalFactory(count, overrides);
