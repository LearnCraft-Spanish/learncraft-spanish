import type { ReachableSkills, SkillTag } from '@learncraft-spanish/shared';
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
const tagWithKey = (key: string): SkillTag => ({ ...vocabularyTag(1), key });

const reachableVocabulary = (vocabularyIds: number[]): ReachableSkills => ({
  vocabularyIds,
  subcategoryIds: [],
  verbIds: [],
  conjugationTags: [],
});

const setReachableSkills = (reachableSkills?: ReachableSkills): void => {
  mockUseReachableSkills.mockReturnValue({
    reachableSkills,
    isLoading: false,
    error: null,
  });
};

const coord = overrideMockUseExampleFilterCoordinator;
const courses = overrideMockSelectedCourseAndLessons;
const withTags = (...ids: number[]) => ({
  selectedSkillTags: ids.map(vocabularyTag),
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
    setReachableSkills(undefined);
    mockUseSkillTagSearch.mockReset();
    mockUseSkillTagSearch.mockReturnValue({ tagSuggestions: [] });
  });

  describe('course catalog', () => {
    it('returns the course catalog from the courses query', () => {
      const course = createMockCourseWithLessons();
      mockUseCoursesWithLessons.mockReturnValue({ data: [course] });

      const { result } = renderHook(() => useCombinedFilters({}));

      expect(result.current.coursesWithLessons).toEqual([course]);
    });

    it('returns an empty catalog when the courses query has no data yet', () => {
      const { result } = renderHook(() => useCombinedFilters({}));

      expect(result.current.coursesWithLessons).toEqual([]);
    });

    it.each([true, false])(
      'asks the courses query for unpublished = %s as the filter coordinator says',
      (includeUnpublished) => {
        coord({ includeUnpublished });

        renderHook(() => useCombinedFilters({}));

        expect(mockUseCoursesWithLessons).toHaveBeenCalledWith(
          includeUnpublished,
        );
      },
    );
  });

  describe('filterState', () => {
    it('carries the coordinator filters and the selected lesson range', () => {
      const tags = [vocabularyTag(1)];
      coord({
        excludeSpanglish: true,
        audioOnly: true,
        includeUnpublished: true,
        selectedSkillTags: tags,
      });
      courses({
        course: createMockCourseWithLessons({ id: 2 }),
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
  });

  describe('filterPreset', () => {
    it('reports the preset whose tags are exactly the selected tags, in any order', () => {
      coord({
        selectedSkillTags: [tagWithKey('Verb-5'), tagWithKey('Verb-1')],
      });

      const { result } = renderHook(() => useCombinedFilters({}));

      expect(result.current.filterPreset).toBe(PreSetQuizPreset.SerEstar);
    });

    it.each([
      ['only some of a preset’s tags', ['Verb-1']],
      ['extra tags beyond a preset', ['Verb-1', 'Verb-5', 'Vocabulary-99']],
      ['no tags', []],
    ])('reports no preset for %s', (_name, keys) => {
      coord({
        selectedSkillTags: keys.map(tagWithKey),
      });

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

  describe('tags outside the lesson range', () => {
    beforeEach(() => {
      coord(withTags(1, 2));
    });

    it('lists the selected tags that cannot appear in the lesson range', () => {
      setReachableSkills(reachableVocabulary([1]));

      const { result } = renderHook(() => useCombinedFilters({}));

      expect(result.current.outOfRangeSkillTagKeys).toEqual(['Vocabulary-2']);
    });

    it('lists none, and searches the whole catalog, when tags are not restricted to the lesson range', () => {
      setReachableSkills(reachableVocabulary([1]));

      const { result } = renderHook(() =>
        useCombinedFilters({ restrictTagsToLessonRange: false }),
      );

      expect(result.current.outOfRangeSkillTagKeys).toEqual([]);
      expect(mockUseSkillTagSearch).toHaveBeenCalledWith({
        reachableSkills: undefined,
      });
    });

    it('limits tag search to the reachable skills by default', () => {
      const reachableSkills = reachableVocabulary([1]);
      setReachableSkills(reachableSkills);

      renderHook(() => useCombinedFilters({}));

      expect(mockUseSkillTagSearch).toHaveBeenCalledWith({ reachableSkills });
    });
  });

  describe('onFilterChange', () => {
    const renderWithCallback = () => {
      const onFilterChange = vi.fn();
      const utils = renderHook(() => useCombinedFilters({ onFilterChange }));
      return { onFilterChange, ...utils };
    };

    it('is not called on the initial render', () => {
      const { onFilterChange } = renderWithCallback();

      expect(onFilterChange).not.toHaveBeenCalled();
    });

    it('is not called when the filters are re-read with the same values', () => {
      coord(withTags(1));
      const { onFilterChange, rerender } = renderWithCallback();

      // A fresh array holding the same tags is not a filter change.
      coord(withTags(1));
      rerender();

      expect(onFilterChange).not.toHaveBeenCalled();
    });

    it.each<[string, (() => void) | null, () => void]>([
      [
        'excludeSpanglish changes',
        null,
        () => coord({ excludeSpanglish: true }),
      ],
      ['audioOnly changes', null, () => coord({ audioOnly: true })],
      [
        'includeUnpublished changes',
        null,
        () => coord({ includeUnpublished: true }),
      ],
      ['a skill tag is added', null, () => coord(withTags(1))],
      [
        'a skill tag is removed',
        () => coord(withTags(1, 2)),
        () => coord(withTags(1)),
      ],
      [
        'one skill tag is swapped for another',
        () => coord(withTags(1)),
        () => coord(withTags(2)),
      ],
      [
        'the selected course changes',
        () => courses({ course: createMockCourseWithLessons({ id: 2 }) }),
        () => courses({ course: createMockCourseWithLessons({ id: 3 }) }),
      ],
      [
        'the from lesson changes',
        () => courses({ fromLesson: lesson(1) }),
        () => courses({ fromLesson: lesson(2) }),
      ],
      [
        'the to lesson changes',
        () => courses({ toLesson: lesson(5) }),
        () => courses({ toLesson: lesson(6) }),
      ],
    ])('is called once when %s', (_name, before, change) => {
      before?.();
      const { onFilterChange, rerender } = renderWithCallback();

      change();
      rerender();
      rerender();

      expect(onFilterChange).toHaveBeenCalledTimes(1);
    });
  });

  describe('loading and error', () => {
    it('is loading while the filter coordinator is loading', () => {
      coord({ isLoading: true });

      const { result } = renderHook(() => useCombinedFilters({}));

      expect(result.current.isLoading).toBe(true);
    });

    it('surfaces a filter-coordinator failure on the combined error', () => {
      const error = new Error('skill tags failed');
      coord({ error });

      const { result } = renderHook(() => useCombinedFilters({}));

      expect(result.current.error).toBe(error);
    });

    it('surfaces a course-coordinator failure on the combined error', () => {
      const error = new Error('courses failed');
      courses({ error });

      const { result } = renderHook(() => useCombinedFilters({}));

      expect(result.current.error).toBe(error);
    });
  });
});
