// test/factories/vocabulary.ts
import type {
  Vocabulary,
  VocabularyRelatedRecords,
} from '@LearnCraft-Spanish/shared';
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

export const createMockVocabulary =
  createZodFactory<Vocabulary>(VocabularySchema);
export const createMockVocabularyList =
  createZodListFactory<Vocabulary>(VocabularySchema);

export const createMockCreateNonVerbVocabulary = createZodFactory(
  CreateNonVerbVocabularySchema,
);
export const createMockCreateNonVerbVocabularyList = createZodListFactory(
  CreateNonVerbVocabularySchema,
);

export const createMockCreateVerb = createZodFactory(CreateVerbSchema);
export const createMockCreateVerbList = createZodListFactory(CreateVerbSchema);

export const createMockVocabularyRelatedRecords =
  createZodFactory<VocabularyRelatedRecords>(VocabularyRelatedRecordsSchema);
