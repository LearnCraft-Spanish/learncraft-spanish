import type { ExampleFilterStateWithoutLesson } from '@application/coordinators/contexts/ExampleFilterContext';
import type { UseExampleFilterCoordinatorReturnType } from '@application/coordinators/hooks/useExampleFilterCoordinator';
import { createOverrideableMock } from '@testing/utils/createOverrideableMock';
import { vi } from 'vitest';

/**
 * Not registered in `setupTests.ts`. In a test file, mock the hook's module with an
 * async factory that imports this file and returns
 * `{ useExampleFilterCoordinator: () => mockUseExampleFilterCoordinator }` (see `useCombinedFilters.test.ts`).
 */
const defaultMockResult: UseExampleFilterCoordinatorReturnType = {
  filterStateWithoutLesson: {
    excludeSpanglish: false,
    audioOnly: false,
    skillTagKeys: [],
    includeUnpublished: false,
  },
  selectedSkillTags: [],
  excludeSpanglish: false,
  audioOnly: false,
  includeUnpublished: false,
  batchUpdateFilterStateWithoutLesson:
    vi.fn<(filters: ExampleFilterStateWithoutLesson) => void>(),
  addSkillTagToFilters: vi.fn<(tagKey: string) => void>(),
  removeSkillTagFromFilters: vi.fn<(tagKey: string) => void>(),
  bulkUpdateSkillTagKeys: vi.fn<(skillTagKeys: string[]) => void>(),
  updateExcludeSpanglish: vi.fn<(excludeSpanglish: boolean) => void>(),
  updateAudioOnly: vi.fn<(audioOnly: boolean) => void>(),
  updateIncludeUnpublished: vi.fn<(includeUnpublished: boolean) => void>(),
  isLoading: false,
  error: null,
};

export const {
  mock: mockUseExampleFilterCoordinator,
  override: overrideMockUseExampleFilterCoordinator,
  reset: resetMockUseExampleFilterCoordinator,
} = createOverrideableMock<UseExampleFilterCoordinatorReturnType>(
  defaultMockResult,
);

export default mockUseExampleFilterCoordinator;
