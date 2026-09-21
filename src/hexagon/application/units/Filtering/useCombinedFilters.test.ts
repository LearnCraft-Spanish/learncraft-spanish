import type { UseExampleFilterCoordinatorReturnType } from '@application/coordinators/hooks/useExampleFilterCoordinator';
import {
  overrideMockSelectedCourseAndLessons,
  resetMockSelectedCourseAndLessons,
} from '@application/coordinators/hooks/useSelectedCourseAndLessons.mock';
import { useCombinedFilters } from '@application/units/Filtering/useCombinedFilters';
import { renderHook } from '@testing-library/react';
import { createMockCourseWithLessons } from '@testing/factories/courseFactory';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mockUseCoursesWithLessons = vi.fn();

const coordinator: UseExampleFilterCoordinatorReturnType = {
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
  batchUpdateFilterStateWithoutLesson: vi.fn(),
  addSkillTagToFilters: vi.fn(),
  removeSkillTagFromFilters: vi.fn(),
  bulkUpdateSkillTagKeys: vi.fn(),
  updateExcludeSpanglish: vi.fn(),
  updateAudioOnly: vi.fn(),
  updateIncludeUnpublished: vi.fn(),
  isLoading: false,
  error: null,
};

vi.mock('@application/coordinators/hooks/useExampleFilterCoordinator', () => ({
  useExampleFilterCoordinator: () => coordinator,
}));

vi.mock('@application/queries/useCoursesWithLessons', () => ({
  useCoursesWithLessons: (includeUnpublished: boolean) =>
    mockUseCoursesWithLessons(includeUnpublished),
}));

vi.mock('@application/queries/useReachableSkills', () => ({
  useReachableSkills: () => ({
    reachableSkills: undefined,
    isLoading: false,
    error: null,
  }),
}));

vi.mock('@application/units/useSkillTagSearch', () => ({
  useSkillTagSearch: () => ({
    tagSearchTerm: '',
    tagSuggestions: [],
    updateTagSearchTerm: vi.fn(),
    removeTagFromSuggestions: vi.fn(),
    addTagBackToSuggestions: vi.fn(),
    isLoading: false,
    error: null,
  }),
}));

describe('useCombinedFilters', () => {
  beforeEach(() => {
    resetMockSelectedCourseAndLessons();
    coordinator.includeUnpublished = false;
    coordinator.error = null;
    coordinator.isLoading = false;
    mockUseCoursesWithLessons.mockReset();
    mockUseCoursesWithLessons.mockReturnValue({
      data: undefined,
      isLoading: false,
      error: null,
    });
  });

  it('returns the course catalog from the courses query', () => {
    const course = createMockCourseWithLessons();
    mockUseCoursesWithLessons.mockReturnValue({
      data: [course],
      isLoading: false,
      error: null,
    });

    const { result } = renderHook(() => useCombinedFilters({}));

    expect(result.current.coursesWithLessons).toEqual([course]);
  });

  it('returns an empty catalog when the courses query has no data yet', () => {
    const { result } = renderHook(() => useCombinedFilters({}));

    expect(result.current.coursesWithLessons).toEqual([]);
  });

  it('asks for unpublished courses only when the filter coordinator includes them', () => {
    coordinator.includeUnpublished = true;

    renderHook(() => useCombinedFilters({}));

    expect(mockUseCoursesWithLessons).toHaveBeenCalledWith(true);
  });

  it('surfaces a course-coordinator failure on the combined error', () => {
    overrideMockSelectedCourseAndLessons({
      error: new Error('courses failed'),
    });

    const { result } = renderHook(() => useCombinedFilters({}));

    expect(result.current.error).toEqual(new Error('courses failed'));
    expect(result.current.coursesWithLessons).toEqual([]);
  });
});
