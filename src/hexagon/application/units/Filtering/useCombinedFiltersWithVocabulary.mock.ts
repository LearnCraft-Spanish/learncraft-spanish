import type { UseCombinedFiltersWithVocabularyReturnType } from '@application/units/Filtering/useCombinedFiltersWithVocabulary';
import { defaultMockUseCombinedFiltersResult as defaultCombinedFiltersResult } from '@application/units/Filtering/useCombinedFilters.mock';
import { createOverrideableMock } from '@testing/utils/createOverrideableMock';

/**
 * Not registered in `setupTests.ts`: install it per test file with
 * `vi.mock('@application/units/Filtering/useCombinedFiltersWithVocabulary', async () => {
 *   const { mockUseCombinedFiltersWithVocabulary } = await import(
 *     '@application/units/Filtering/useCombinedFiltersWithVocabulary.mock'
 *   );
 *   return {
 *     useCombinedFiltersWithVocabulary: () => mockUseCombinedFiltersWithVocabulary,
 *   };
 * });`
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
