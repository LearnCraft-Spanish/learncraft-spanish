import type { UseAllVocabularyResult } from '@application/queries/useAllVocabulary';
import { createMockVocabularyList } from '@testing/factories/vocabularyFactories';
import { createOverrideableMock } from '@testing/utils/createOverrideableMock';

const defaultMockResult: UseAllVocabularyResult = {
  vocabulary: createMockVocabularyList(),
  loading: false,
  error: null,
  refetch: () => {},
};

export const {
  mock: mockUseAllVocabulary,
  override: overrideMockUseAllVocabulary,
  reset: resetMockUseAllVocabulary,
} = createOverrideableMock<UseAllVocabularyResult>(defaultMockResult);

export default mockUseAllVocabulary;
