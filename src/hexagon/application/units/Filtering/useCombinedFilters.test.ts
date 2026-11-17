import type { ReachableSkills, SkillTag } from '@learncraft-spanish/shared';
import { overrideMockAuthAdapter } from '@application/adapters/authAdapter.mock';
import {
  mockUseExampleFilterCoordinator,
  overrideMockUseExampleFilterCoordinator,
  resetMockUseExampleFilterCoordinator,
} from '@application/coordinators/hooks/useExampleFilterCoordinator.mock';
import {
  overrideMockSelectedCourseAndLessons,
  resetMockSelectedCourseAndLessons,
} from '@application/coordinators/hooks/useSelectedCourseAndLessons.mock';
import { PreSetQuizPreset } from '@application/units/Filtering/FilterPresets/preSetQuizzes';
import { useCombinedFilters } from '@application/units/Filtering/useCombinedFilters';
import { SkillType } from '@learncraft-spanish/shared';
import { renderHook } from '@testing-library/react';
import { createMockCourseWithLessons } from '@testing/factories/courseFactory';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mockUseCoursesWithLessons = vi.hoisted(() => vi.fn());
const mockUseReachableSkills = vi.hoisted(() => vi.fn());
const mockUseSkillTagSearch = vi.hoisted(() => vi.fn());

vi.mock(
  '@application/coordinators/hooks/useExampleFilterCoordinator',
  async () => {
    const { mockUseExampleFilterCoordinator: coordinator } =
      await import('@application/coordinators/hooks/useExampleFilterCoordinator.mock');
    return { useExampleFilterCoordinator: () => coordinator };
  },
);

vi.mock('@application/queries/useCoursesWithLessons', () => ({
  useCoursesWithLessons: mockUseCoursesWithLessons,
}));

vi.mock('@application/queries/useReachableSkills', () => ({
  useReachableSkills: mockUseReachableSkills,
}));

vi.mock('@application/units/useSkillTagSearch', () => ({
  useSkillTagSearch: mockUseSkillTagSearch,
}));

const vocabularyTag = (vocabularyId: number): SkillTag => ({
  type: SkillType.Vocabulary,
  key: `Vocabulary-${vocabularyId}`,
  name: `word ${vocabularyId}`,
  descriptor: '',
  vocabularyId,
  subcategoryName: 'Nouns',
  frequency: null,
});

/** Preset membership is decided by tag key alone. */
const tagWithKey = (key: string): SkillTag => ({
  ...vocabularyTag(1),
  key,
});

const reachableSkillsWithVocabulary = (
  vocabularyIds: number[],
): ReachableSkills => ({
  vocabularyIds,
  subcategoryIds: [],
  verbIds: [],
  conjugationTags: [],
});

const lesson = (lessonNumber: number) => ({
  id: lessonNumber,
  lessonNumber,
  courseName: 'Test Course',
});

describe('useCombinedFilters', () => {
  beforeEach(() => {
    resetMockSelectedCourseAndLessons();
    resetMockUseExampleFilterCoordinator();
    mockUseCoursesWithLessons.mockReset();
    mockUseCoursesWithLessons.mockReturnValue({
      data: undefined,
      isLoading: false,
      error: null,
    });
    mockUseReachableSkills.mockReset();
    mockUseReachableSkills.mockReturnValue({
      reachableSkills: undefined,
      isLoading: false,
      error: null,
    });
    mockUseSkillTagSearch.mockReset();
    mockUseSkillTagSearch.mockReturnValue({
      tagSearchTerm: '',
      tagSuggestions: [],
      updateTagSearchTerm: vi.fn(),
      removeTagFromSuggestions: vi.fn(),
      addTagBackToSuggestions: vi.fn(),
      isLoading: false,
      error: null,
    });
  });

  describe('course catalog', () => {
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
      overrideMockUseExampleFilterCoordinator({ includeUnpublished: true });

      renderHook(() => useCombinedFilters({}));

      expect(mockUseCoursesWithLessons).toHaveBeenCalledWith(true);
    });

    it('asks for published courses only when the filter coordinator excludes unpublished', () => {
      renderHook(() => useCombinedFilters({}));

      expect(mockUseCoursesWithLessons).toHaveBeenCalledWith(false);
    });
  });

  describe('filterState', () => {
    it('carries the coordinator filters and the selected lesson range', () => {
      const course = createMockCourseWithLessons({ id: 2 });
      const tags = [vocabularyTag(1)];
      overrideMockUseExampleFilterCoordinator({
        excludeSpanglish: true,
        audioOnly: true,
        includeUnpublished: true,
        selectedSkillTags: tags,
      });
      overrideMockSelectedCourseAndLessons({
        course,
        courseId: 2,
        fromLesson: lesson(3),
        fromLessonNumber: 3,
        toLesson: lesson(9),
        toLessonNumber: 9,
      });

      const { result } = renderHook(() => useCombinedFilters({}));

      expect(result.current.filterState).toEqual({
        excludeSpanglish: true,
        audioOnly: true,
        includeUnpublished: true,
        skillTags: tags,
        lessonRanges: [{ courseId: 2, fromLessonNumber: 3, toLessonNumber: 9 }],
      });
    });

    it('has no lesson range while no course is selected', () => {
      const { result } = renderHook(() => useCombinedFilters({}));

      expect(result.current.filterState.lessonRanges).toEqual([]);
    });
  });

  describe('filterPreset', () => {
    it('reports the preset whose tags are exactly the selected tags, in any order', () => {
      overrideMockUseExampleFilterCoordinator({
        selectedSkillTags: [tagWithKey('Verb-5'), tagWithKey('Verb-1')],
      });

      const { result } = renderHook(() => useCombinedFilters({}));

      expect(result.current.filterPreset).toBe(PreSetQuizPreset.SerEstar);
    });

    it('reports no preset when only some of a preset’s tags are selected', () => {
      overrideMockUseExampleFilterCoordinator({
        selectedSkillTags: [tagWithKey('Verb-1')],
      });

      const { result } = renderHook(() => useCombinedFilters({}));

      expect(result.current.filterPreset).toBe(PreSetQuizPreset.None);
    });

    it('reports no preset when extra tags are selected beyond a preset', () => {
      overrideMockUseExampleFilterCoordinator({
        selectedSkillTags: [
          tagWithKey('Verb-1'),
          tagWithKey('Verb-5'),
          vocabularyTag(99),
        ],
      });

      const { result } = renderHook(() => useCombinedFilters({}));

      expect(result.current.filterPreset).toBe(PreSetQuizPreset.None);
    });

    it('reports no preset when nothing is selected', () => {
      const { result } = renderHook(() => useCombinedFilters({}));

      expect(result.current.filterPreset).toBe(PreSetQuizPreset.None);
    });

    it('selects a preset’s tags through the filter coordinator', () => {
      const { result } = renderHook(() => useCombinedFilters({}));

      result.current.setFilterPreset(PreSetQuizPreset.SerEstar);

      expect(
        mockUseExampleFilterCoordinator.bulkUpdateSkillTagKeys,
      ).toHaveBeenCalledWith(['Verb-1', 'Verb-5']);
    });
  });

  describe('outOfRangeSkillTagKeys', () => {
    it('lists the selected tags that cannot appear in the lesson range', () => {
      overrideMockUseExampleFilterCoordinator({
        selectedSkillTags: [vocabularyTag(1), vocabularyTag(2)],
      });
      mockUseReachableSkills.mockReturnValue({
        reachableSkills: reachableSkillsWithVocabulary([1]),
        isLoading: false,
        error: null,
      });

      const { result } = renderHook(() => useCombinedFilters({}));

      expect(result.current.outOfRangeSkillTagKeys).toEqual(['Vocabulary-2']);
    });

    it('is empty while the reachable skills have not loaded', () => {
      overrideMockUseExampleFilterCoordinator({
        selectedSkillTags: [vocabularyTag(1)],
      });

      const { result } = renderHook(() => useCombinedFilters({}));

      expect(result.current.outOfRangeSkillTagKeys).toEqual([]);
    });

    it('is empty when tags are not restricted to the lesson range', () => {
      overrideMockUseExampleFilterCoordinator({
        selectedSkillTags: [vocabularyTag(2)],
      });
      mockUseReachableSkills.mockReturnValue({
        reachableSkills: reachableSkillsWithVocabulary([1]),
        isLoading: false,
        error: null,
      });

      const { result } = renderHook(() =>
        useCombinedFilters({ restrictTagsToLessonRange: false }),
      );

      expect(result.current.outOfRangeSkillTagKeys).toEqual([]);
    });
  });

  describe('tag search restriction', () => {
    it('limits tag search to the reachable skills by default', () => {
      const reachableSkills = reachableSkillsWithVocabulary([1]);
      mockUseReachableSkills.mockReturnValue({
        reachableSkills,
        isLoading: false,
        error: null,
      });

      renderHook(() => useCombinedFilters({}));

      expect(mockUseSkillTagSearch).toHaveBeenCalledWith({ reachableSkills });
    });

    it('searches the whole tag catalog when not restricted to the lesson range', () => {
      mockUseReachableSkills.mockReturnValue({
        reachableSkills: reachableSkillsWithVocabulary([1]),
        isLoading: false,
        error: null,
      });

      renderHook(() =>
        useCombinedFilters({ restrictTagsToLessonRange: false }),
      );

      expect(mockUseSkillTagSearch).toHaveBeenCalledWith({
        reachableSkills: undefined,
      });
    });
  });

  describe('onFilterChange', () => {
    it('is not called on the initial render', () => {
      const onFilterChange = vi.fn();

      renderHook(() => useCombinedFilters({ onFilterChange }));

      expect(onFilterChange).not.toHaveBeenCalled();
    });

    it('is not called when the filters are re-read with the same values', () => {
      const onFilterChange = vi.fn();
      overrideMockUseExampleFilterCoordinator({
        selectedSkillTags: [vocabularyTag(1)],
      });
      const { rerender } = renderHook(() =>
        useCombinedFilters({ onFilterChange }),
      );

      // A fresh array holding the same tags is not a filter change.
      overrideMockUseExampleFilterCoordinator({
        selectedSkillTags: [vocabularyTag(1)],
      });
      rerender();

      expect(onFilterChange).not.toHaveBeenCalled();
    });

    it.each([
      ['excludeSpanglish', { excludeSpanglish: true }],
      ['audioOnly', { audioOnly: true }],
      ['includeUnpublished', { includeUnpublished: true }],
    ])('is called when %s changes', (_name, change) => {
      const onFilterChange = vi.fn();
      const { rerender } = renderHook(() =>
        useCombinedFilters({ onFilterChange }),
      );

      overrideMockUseExampleFilterCoordinator(change);
      rerender();

      expect(onFilterChange).toHaveBeenCalledTimes(1);
    });

    it('is called when a skill tag is added', () => {
      const onFilterChange = vi.fn();
      const { rerender } = renderHook(() =>
        useCombinedFilters({ onFilterChange }),
      );

      overrideMockUseExampleFilterCoordinator({
        selectedSkillTags: [vocabularyTag(1)],
      });
      rerender();

      expect(onFilterChange).toHaveBeenCalledTimes(1);
    });

    it('is called when a skill tag is removed', () => {
      const onFilterChange = vi.fn();
      overrideMockUseExampleFilterCoordinator({
        selectedSkillTags: [vocabularyTag(1), vocabularyTag(2)],
      });
      const { rerender } = renderHook(() =>
        useCombinedFilters({ onFilterChange }),
      );

      overrideMockUseExampleFilterCoordinator({
        selectedSkillTags: [vocabularyTag(1)],
      });
      rerender();

      expect(onFilterChange).toHaveBeenCalledTimes(1);
    });

    it('is called when one skill tag is swapped for another', () => {
      const onFilterChange = vi.fn();
      overrideMockUseExampleFilterCoordinator({
        selectedSkillTags: [vocabularyTag(1)],
      });
      const { rerender } = renderHook(() =>
        useCombinedFilters({ onFilterChange }),
      );

      overrideMockUseExampleFilterCoordinator({
        selectedSkillTags: [vocabularyTag(2)],
      });
      rerender();

      expect(onFilterChange).toHaveBeenCalledTimes(1);
    });

    it('is called when the selected course changes', () => {
      const onFilterChange = vi.fn();
      overrideMockSelectedCourseAndLessons({
        course: createMockCourseWithLessons({ id: 2 }),
        courseId: 2,
      });
      const { rerender } = renderHook(() =>
        useCombinedFilters({ onFilterChange }),
      );

      overrideMockSelectedCourseAndLessons({
        course: createMockCourseWithLessons({ id: 3 }),
        courseId: 3,
      });
      rerender();

      expect(onFilterChange).toHaveBeenCalledTimes(1);
    });

    it('is called when the from lesson changes', () => {
      const onFilterChange = vi.fn();
      overrideMockSelectedCourseAndLessons({
        fromLesson: lesson(1),
        fromLessonNumber: 1,
      });
      const { rerender } = renderHook(() =>
        useCombinedFilters({ onFilterChange }),
      );

      overrideMockSelectedCourseAndLessons({
        fromLesson: lesson(2),
        fromLessonNumber: 2,
      });
      rerender();

      expect(onFilterChange).toHaveBeenCalledTimes(1);
    });

    it('is called when the to lesson changes', () => {
      const onFilterChange = vi.fn();
      overrideMockSelectedCourseAndLessons({
        toLesson: lesson(5),
        toLessonNumber: 5,
      });
      const { rerender } = renderHook(() =>
        useCombinedFilters({ onFilterChange }),
      );

      overrideMockSelectedCourseAndLessons({
        toLesson: lesson(6),
        toLessonNumber: 6,
      });
      rerender();

      expect(onFilterChange).toHaveBeenCalledTimes(1);
    });

    it('is called once per change, not on later re-renders with the same filters', () => {
      const onFilterChange = vi.fn();
      const { rerender } = renderHook(() =>
        useCombinedFilters({ onFilterChange }),
      );
      overrideMockUseExampleFilterCoordinator({ audioOnly: true });
      rerender();

      rerender();

      expect(onFilterChange).toHaveBeenCalledTimes(1);
    });
  });

  describe('loading, error and role', () => {
    it('is loading while the filter coordinator is loading', () => {
      overrideMockUseExampleFilterCoordinator({ isLoading: true });

      const { result } = renderHook(() => useCombinedFilters({}));

      expect(result.current.isLoading).toBe(true);
    });

    it('is not loading once the filter coordinator has loaded', () => {
      const { result } = renderHook(() => useCombinedFilters({}));

      expect(result.current.isLoading).toBe(false);
    });

    it('has no error when neither coordinator failed', () => {
      const { result } = renderHook(() => useCombinedFilters({}));

      expect(result.current.error).toBeNull();
    });

    it('surfaces a filter-coordinator failure on the combined error', () => {
      overrideMockUseExampleFilterCoordinator({
        error: new Error('skill tags failed'),
      });

      const { result } = renderHook(() => useCombinedFilters({}));

      expect(result.current.error).toEqual(new Error('skill tags failed'));
    });

    it('surfaces a course-coordinator failure on the combined error', () => {
      overrideMockSelectedCourseAndLessons({
        error: new Error('courses failed'),
      });

      const { result } = renderHook(() => useCombinedFilters({}));

      expect(result.current.error).toEqual(new Error('courses failed'));
      expect(result.current.coursesWithLessons).toEqual([]);
    });

    it.each([true, false])(
      'reports isAdmin = %s from the signed-in user',
      (isAdmin) => {
        overrideMockAuthAdapter({ isAdmin });

        const { result } = renderHook(() => useCombinedFilters({}));

        expect(result.current.isAdmin).toBe(isAdmin);
      },
    );
  });
});
