import type {
  ExampleMaxFrequency,
  ExampleTechnical,
  ExampleWithVocabulary,
} from '@learncraft-spanish/shared';
import {
  exampleMaxFrequencySchema,
  exampleTechnicalSchema,
  exampleWithVocabularySchema,
} from '@learncraft-spanish/shared';
import { createZodListFactory } from '@testing/utils/factoryTools';

const factory = createZodListFactory(exampleWithVocabularySchema);
const technicalFactory = createZodListFactory(exampleTechnicalSchema);
const maxFrequencyFactory = createZodListFactory(exampleMaxFrequencySchema);
export const createMockExampleWithVocabularyList = (
  count?: number,
  overrides?: Partial<ExampleWithVocabulary>,
) => factory(count, overrides);

export const createMockExampleTechnicalList = (
  count?: number,
  overrides?: Partial<ExampleTechnical>,
) => technicalFactory(count, overrides);

export const createMockExampleMaxFrequencyList = (
  count?: number,
  overrides?: Partial<ExampleMaxFrequency>,
) => maxFrequencyFactory(count, overrides);
