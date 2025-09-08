import type { UseSelectedCourseAndLessonsReturnType } from '../coordinators/hooks/types';
import type { UseExampleFilterCoordinatorReturnType } from '../coordinators/hooks/useExampleFilterCoordinator';
import type { UseSkillTagSearchReturnType } from './useSkillTagSearch';
import { useExampleFilterCoordinator } from '../coordinators/hooks/useExampleFilterCoordinator';
import { useSelectedCourseAndLessons } from '../coordinators/hooks/useSelectedCourseAndLessons';
import { useSkillTagSearch } from './useSkillTagSearch';

export interface UseExampleFilterReturnType {
  initialLoading: boolean;
  courseAndLessonState: UseSelectedCourseAndLessonsReturnType;
  filterState: UseExampleFilterCoordinatorReturnType;
  skillTagSearch: UseSkillTagSearchReturnType;
}

export function useExampleFilter(): UseExampleFilterReturnType {
  const {
    course,
    fromLesson,
    toLesson,
    updateFromLessonNumber,
    updateToLessonNumber,
    updateUserSelectedCourseId,

    isLoading: isCourseAndLessonLoading,
  } = useSelectedCourseAndLessons();
  const {
    filterState,
    addSkillTagToFilters,
    removeSkillTagFromFilters,
    updateExcludeSpanglish,
    updateAudioOnly,
  }: UseExampleFilterCoordinatorReturnType = useExampleFilterCoordinator();
  const skillTagSearch: UseSkillTagSearchReturnType = useSkillTagSearch();

  const courseAndLessonState: UseSelectedCourseAndLessonsReturnType = {
    course,
    fromLesson,
    toLesson,
    updateFromLessonNumber,
    updateToLessonNumber,
    updateUserSelectedCourseId,

    isLoading: isCourseAndLessonLoading,
  };

  return {
    initialLoading: isCourseAndLessonLoading,
    courseAndLessonState,
    filterState: {
      filterState,
      addSkillTagToFilters,
      removeSkillTagFromFilters,
      updateExcludeSpanglish,
      updateAudioOnly,
    },
    skillTagSearch,
  };
}
