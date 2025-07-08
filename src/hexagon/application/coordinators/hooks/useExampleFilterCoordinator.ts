import type { ExampleFilterState } from '@application/coordinators/contexts/ExampleFilterContext';
import type {
  Course,
  Lesson,
} from '@LearnCraft-Spanish/shared/dist/domain/courses/core-types';
import { ExampleFilterContext } from '@application/coordinators/contexts/ExampleFilterContext';
import { use, useCallback, useMemo, useState } from 'react';
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
  updateExcludeSpanglish: (excludeSpanglish: boolean) => void;
  updateAudioOnly: (audioOnly: boolean) => void;
  setFiltersChanging: (filtersChanging: boolean) => void;
  skillTagKeys: string[];
}

export function useExampleFilterCoordinator(): UseExampleFilterCoordinatorReturnType {
  const { exampleFilters, updateExampleFilters } = use(ExampleFilterContext);
  const { course, fromLesson, toLesson } = useSelectedCourseAndLessons();
  const [filtersChanging, setFiltersChanging] = useState(false);

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

  const updateExcludeSpanglish = useCallback(
    (excludeSpanglish: boolean) => {
      if (!filtersChanging) {
        return;
      }
      updateExampleFilters({ ...exampleFilters, excludeSpanglish });
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
    updateExcludeSpanglish,
    updateAudioOnly,
    setFiltersChanging,

    skillTagKeys: exampleFilters.skillTags,
  };
}
