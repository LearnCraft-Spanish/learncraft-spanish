// test/factories/vocabulary.ts
import {
  CreateNonVerbVocabularySchema,
  CreateVerbSchema,
  VocabularyRelatedRecordsSchema,
  VocabularySchema,
} from '@LearnCraft-Spanish/shared';
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

export const createMockVocabularyRelatedRecords = createZodFactory(
  VocabularyRelatedRecordsSchema,
);
