import type { VocabularyPort } from '@application/ports/vocabularyPort';
import type { CreateVocabulary } from '@learncraft-spanish/shared';
import {
  createMockVocabulary,
  createMockVocabularyAbbreviationList,
  createMockVocabularyList,
  createMockVocabularyRelatedRecords,
} from '@testing/factories/vocabularyFactories';
import { createOverrideableMock } from '@testing/utils/createOverrideableMock';

// Create a default mock implementation matching the port exactly
const defaultMockAdapter: VocabularyPort = {
  getVocabulary: () => Promise.resolve(createMockVocabularyAbbreviationList()),
  getVocabularyBySubcategory: (_subcategoryId, _page, _limit) =>
    Promise.resolve(createMockVocabularyList()),
  getVocabularyById: (id) => Promise.resolve(createMockVocabulary({ id })),
  getVocabularyCount: () => Promise.resolve(1),
  getVocabularyCountBySubcategory: (_subcategoryId) => Promise.resolve(1),
  createVocabulary: (_command: CreateVocabulary[]) =>
    Promise.resolve([1, 2, 3]),
  deleteVocabulary: (_id: number[]) => Promise.resolve(3),
  getRelatedRecords: (id: number) =>
    Promise.resolve(
      createMockVocabularyRelatedRecords({ vocabularyRecordId: id }),
    ),
};

// Create an overrideable mock with the default implementation
export const {
  mock: mockVocabularyAdapter,
  override: overrideMockVocabularyAdapter,
  reset: resetMockVocabularyAdapter,
} = createOverrideableMock<VocabularyPort>(defaultMockAdapter);

// Export the default mock for global mocking
export default mockVocabularyAdapter;
