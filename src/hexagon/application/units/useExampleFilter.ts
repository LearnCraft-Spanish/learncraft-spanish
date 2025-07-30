import type { SkillTag } from '@learncraft-spanish/shared';
import type { UseSelectedCourseAndLessonsReturnType } from '../coordinators/hooks/types';
import type { UseExampleFilterCoordinatorReturnType } from '../coordinators/hooks/useExampleFilterCoordinator';
import type { UseSkillTagSearchReturnType } from './useSkillTagSearch';
import { useCallback, useMemo } from 'react';
import { useExampleFilterCoordinator } from '../coordinators/hooks/useExampleFilterCoordinator';
import { useSelectedCourseAndLessons } from '../coordinators/hooks/useSelectedCourseAndLessons';
import { useSkillTags } from '../queries/useSkillTags';
import { useSkillTagSearch } from './useSkillTagSearch';

export interface UseExampleFilterReturnType {
  courseAndLessonState: UseSelectedCourseAndLessonsReturnType;
  filterState: UseExampleFilterCoordinatorReturnType;
  skillTagSearch: UseSkillTagSearchReturnType;

  filtersChanging: boolean;
  updateFiltersChanging: (filtersChanging: boolean) => void;

  skillTags: SkillTag[];

  initialLoading: boolean;
}

export default function useExampleFilters(): UseExampleFilterReturnType {
  const {
    course,
    fromLesson,
    toLesson,
    updateFromLessonId: hookUpdateFromLessonId,
    updateToLessonId: hookUpdateToLessonId,
    updateUserSelectedCourseId: hookUpdateCourseId,

    isLoading: isCourseAndLessonLoading,
  } = useSelectedCourseAndLessons();
  const filterState: UseExampleFilterCoordinatorReturnType =
    useExampleFilterCoordinator();
  const skillTagSearch: UseSkillTagSearchReturnType = useSkillTagSearch();
  const { skillTags, isLoading: isSkillTagsLoading } = useSkillTags();

  // This logic guards against updating the course and lesson while the search data is fetching
  // This reduces unnecessary re-fetches of the search data
  const { filtersChanging, updateFiltersChanging } = filterState;

  const tags = useMemo(() => {
    if (!skillTags) {
      return [];
    }
    const tagObjects = filterState.skillTagKeys.map((key) =>
      skillTags.find((t) => t.key === key),
    );
    // Filter out undefined values
    return tagObjects.filter(
      (tag): tag is NonNullable<typeof tag> => tag !== undefined,
    );
  }, [filterState.skillTagKeys, skillTags]);

  const updateFromLessonId = useCallback(
    (lessonId: number) => {
      if (!filtersChanging) {
        return;
      }
      hookUpdateFromLessonId(lessonId);
    },
    [hookUpdateFromLessonId, filtersChanging],
  );

  const updateToLessonId = useCallback(
    (lessonId: number) => {
      if (!filtersChanging) {
        return;
      }
      hookUpdateToLessonId(lessonId);
    },
    [hookUpdateToLessonId, filtersChanging],
  );

  const updateUserSelectedCourseId = useCallback(
    (courseId: number) => {
      if (!filtersChanging) {
        return;
      }
      hookUpdateCourseId(courseId);
    },
    [hookUpdateCourseId, filtersChanging],
  );

  const courseAndLessonState: UseSelectedCourseAndLessonsReturnType = {
    course,
    fromLesson,
    toLesson,
    updateFromLessonId,
    updateToLessonId,
    updateUserSelectedCourseId,

    isLoading: isCourseAndLessonLoading,
  };

  return {
    courseAndLessonState,
    filterState,
    skillTagSearch,

    filtersChanging,
    updateFiltersChanging,

    skillTags: tags,

    initialLoading: isCourseAndLessonLoading || isSkillTagsLoading,
  };
}
