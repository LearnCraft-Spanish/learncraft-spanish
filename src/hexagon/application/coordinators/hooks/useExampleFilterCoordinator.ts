import type { ExampleFilterState } from '@application/coordinators/contexts/ExampleFilterContext';
import type {
  Course,
  Lesson,
} from '@learncraft-spanish/shared/dist/domain/courses/core-types';
import { ExampleFilterContext } from '@application/coordinators/contexts/ExampleFilterContext';
import { use, useCallback, useMemo } from 'react';
import { useSelectedCourseAndLessons } from './useSelectedCourseAndLessons';

interface FilterState {
  exampleFilters: ExampleFilterState;
  course: Course | null;
  fromLesson: Lesson | null;
  toLesson: Lesson | null;
}

export interface UseExampleFilterCoordinatorReturnType {
  filterState: FilterState;
  filtersChanging: boolean;
  addSkillTagToFilters: (tagKey: string) => void;
  removeSkillTagFromFilters: (tagKey: string) => void;
  updateIncludeSpanglish: (includeSpanglish: boolean) => void;
  updateAudioOnly: (audioOnly: boolean) => void;
  updateFiltersChanging: (filtersChanging: boolean) => void;
  skillTagKeys: string[];
}

export function useExampleFilterCoordinator(): UseExampleFilterCoordinatorReturnType {
  const {
    exampleFilters,
    updateExampleFilters,
    filtersChanging,
    updateFiltersChanging,
  } = use(ExampleFilterContext);
  const { course, fromLesson, toLesson } = useSelectedCourseAndLessons();

  const filterState: FilterState = useMemo(() => {
    return {
      exampleFilters,
      course,
      fromLesson,
      toLesson,
    };
  }, [exampleFilters, course, fromLesson, toLesson]);

  const addSkillTagToFilters = useCallback(
    (tagKey: string) => {
      if (!filtersChanging) {
        return;
      }
      if (exampleFilters.skillTags.includes(tagKey)) {
        return;
      }
      updateExampleFilters({
        ...exampleFilters,
        skillTags: [...exampleFilters.skillTags, tagKey],
      });
    },
    [exampleFilters, filtersChanging, updateExampleFilters],
  );

  const removeSkillTagFromFilters = useCallback(
    (tagKey: string) => {
      if (!filtersChanging) {
        return;
      }
      updateExampleFilters({
        ...exampleFilters,
        skillTags: exampleFilters.skillTags.filter((tag) => tag !== tagKey),
      });
    },
    [exampleFilters, filtersChanging, updateExampleFilters],
  );

  const updateIncludeSpanglish = useCallback(
    (includeSpanglish: boolean) => {
      if (!filtersChanging) {
        return;
      }
      updateExampleFilters({ ...exampleFilters, includeSpanglish });
    },
    [exampleFilters, filtersChanging, updateExampleFilters],
  );

  const updateAudioOnly = useCallback(
    (audioOnly: boolean) => {
      if (!filtersChanging) {
        return;
      }
      updateExampleFilters({ ...exampleFilters, audioOnly });
    },
    [exampleFilters, filtersChanging, updateExampleFilters],
  );

  return {
    filterState,
    filtersChanging,
    addSkillTagToFilters,
    removeSkillTagFromFilters,
    updateIncludeSpanglish,
    updateAudioOnly,
    updateFiltersChanging,
    skillTagKeys: exampleFilters.skillTags,
  };
}
