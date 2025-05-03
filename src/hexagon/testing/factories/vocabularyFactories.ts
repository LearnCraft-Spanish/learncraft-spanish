// test/factories/vocabulary.ts
import {
  CreateNonVerbVocabularySchema,
  CreateVerbSchema,
  VocabularySchema,
} from '@learncraft-spanish/shared';
import {
  createZodFactory,
  createZodListFactory,
} from '@testing/utils/factoryTools';

export const createMockVocabulary = createZodFactory(VocabularySchema);
export const createMockVocabularyList = createZodListFactory(VocabularySchema);

export const createMockCreateNonVerbVocabulary = createZodFactory(
  CreateNonVerbVocabularySchema,
);
export const createMockCreateNonVerbVocabularyList = createZodListFactory(
  CreateNonVerbVocabularySchema,
);

export const createMockCreateVerb = createZodFactory(CreateVerbSchema);
export const createMockCreateVerbList = createZodListFactory(CreateVerbSchema);
