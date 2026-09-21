import type { ExampleFilterStateWithoutLesson } from '@application/coordinators/contexts/ExampleFilterContext';
import type { UseCombinedFiltersReturnType } from '@application/units/Filtering/useCombinedFilters';
import { PreSetQuizPreset } from '@application/units/Filtering/FilterPresets/preSetQuizzes';
import { createOverrideableMock } from '@testing/utils/createOverrideableMock';
import { vi } from 'vitest';

const defaultMockResult: UseCombinedFiltersReturnType = {
  filterState: {
    lessonRanges: [],
    excludeSpanglish: false,
    audioOnly: false,
    skillTags: [],
    includeUnpublished: false,
  },
  filterStateWithoutLesson: {
    excludeSpanglish: false,
    audioOnly: false,
    skillTagKeys: [],
    includeUnpublished: false,
  },
  batchUpdateFilterStateWithoutLesson:
    vi.fn<(filters: ExampleFilterStateWithoutLesson) => void>(),
  audioOnly: false,
  updateAudioOnly: vi.fn<(audioOnly: boolean) => void>(),
  excludeSpanglish: false,
  updateExcludeSpanglish: vi.fn<(excludeSpanglish: boolean) => void>(),
  includeUnpublished: false,
  updateIncludeUnpublished: vi.fn<(includeUnpublished: boolean) => void>(),
  selectedSkillTags: [],
  outOfRangeSkillTagKeys: [],
  addSkillTagToFilters: vi.fn<(tagKey: string) => void>(),
  removeSkillTagFromFilters: vi.fn<(tagKey: string) => void>(),
  bulkUpdateSkillTagKeys: vi.fn<(skillTagKeys: string[]) => void>(),
  course: null,
  courseId: null,
  updateUserSelectedCourseId: vi.fn<(courseId: number) => void>(),
  fromLesson: null,
  fromLessonNumber: null,
  updateFromLessonNumber: vi.fn<(lessonNumber: number) => void>(),
  toLesson: null,
  toLessonNumber: null,
  updateToLessonNumber: vi.fn<(lessonNumber: number) => void>(),
  skillTagSearch: {
    tagSearchTerm: '',
    tagSuggestions: [],
    updateTagSearchTerm:
      vi.fn<(target?: EventTarget & HTMLInputElement) => void>(),
    removeTagFromSuggestions: vi.fn<(tagKey: string) => void>(),
    addTagBackToSuggestions: vi.fn<(tagKey: string) => void>(),
    isLoading: false,
    error: null,
  },
  filterPreset: PreSetQuizPreset.None,
  setFilterPreset: vi.fn<(preset: PreSetQuizPreset) => void>(),
  coursesWithLessons: [],
  isAdmin: false,
  isLoading: false,
  error: null,
};

export const {
  mock: mockUseCombinedFilters,
  override: overrideMockUseCombinedFilters,
  reset: resetMockUseCombinedFilters,
} = createOverrideableMock<UseCombinedFiltersReturnType>(defaultMockResult);

export default mockUseCombinedFilters;
