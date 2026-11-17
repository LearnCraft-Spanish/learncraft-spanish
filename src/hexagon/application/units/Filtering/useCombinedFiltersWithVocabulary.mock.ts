import type { UseCombinedFiltersWithVocabularyReturnType } from '@application/units/Filtering/useCombinedFiltersWithVocabulary';
import { defaultMockUseCombinedFiltersResult as defaultCombinedFiltersResult } from '@application/units/Filtering/useCombinedFilters.mock';
import { createOverrideableMock } from '@testing/utils/createOverrideableMock';

/**
 * Not registered in `setupTests.ts`. In a test file, mock the hook's module with an
 * async factory that imports this file and returns
 * `{ useCombinedFiltersWithVocabulary: () => mockUseCombinedFiltersWithVocabulary }` (see `useCombinedFilters.test.ts`).
 */
const defaultMockResult: UseCombinedFiltersWithVocabularyReturnType = {
  ...defaultCombinedFiltersResult,
  filterStateWithVocabulary: {
    excludeSpanglish: false,
    audioOnly: false,
    skillTags: [],
    requiredVocabulary: undefined,
    allowedVocabulary: [],
  },
  lessonRangeVocabRequired: undefined,
  lessonVocabKnown: [],
};

export const {
  mock: mockUseCombinedFiltersWithVocabulary,
  override: overrideMockUseCombinedFiltersWithVocabulary,
  reset: resetMockUseCombinedFiltersWithVocabulary,
} = createOverrideableMock<UseCombinedFiltersWithVocabularyReturnType>(
  defaultMockResult,
);

export default mockUseCombinedFiltersWithVocabulary;
