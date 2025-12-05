import type { UseSelectedCourseAndLessonsReturnType } from '@application/coordinators/hooks/types';
import type { UseExampleFilterCoordinatorReturnType } from '@application/coordinators/hooks/useExampleFilterCoordinator';
import type { ExampleFilters as LocalExampleFilters } from '@application/ports/examplePort';
import type { UseSkillTagSearchReturnType } from '@application/units/useSkillTagSearch';
import { useExampleFilterCoordinator } from '@application/coordinators/hooks/useExampleFilterCoordinator';
import { useSelectedCourseAndLessons } from '@application/coordinators/hooks/useSelectedCourseAndLessons';
import {
  PreSetQuizPreset,
  preSetQuizzes,
} from '@application/units/Filtering/FilterPresets/preSetQuizzes';
import { usePresetFilters } from '@application/units/Filtering/FilterPresets/usePresetFilters';
import { useSkillTagSearch } from '@application/units/useSkillTagSearch';
import { transformToLessonRanges } from '@domain/coursePrerequisites';
import { useMemo } from 'react';

export type UseCombinedFiltersReturnType =
  UseExampleFilterCoordinatorReturnType &
    UseSelectedCourseAndLessonsReturnType & {
      filterState: LocalExampleFilters; // Always uses lesson ranges
      skillTagSearch: UseSkillTagSearchReturnType;
      filterPreset: PreSetQuizPreset;
      setFilterPreset: (preset: PreSetQuizPreset) => void;
    };

export interface UseCombinedFiltersProps {
  onFilterChange?: () => void;
}

export function useCombinedFilters({
  onFilterChange = () => {},
}: UseCombinedFiltersProps): UseCombinedFiltersReturnType {
  // Destructure the filter properties from the coordinator
  const {
    filterStateWithoutLesson,
    selectedSkillTags,
    excludeSpanglish,
    audioOnly,
    batchUpdateFilterStateWithoutLesson,
    addSkillTagToFilters,
    removeSkillTagFromFilters,
    bulkUpdateSkillTagKeys,
    updateExcludeSpanglish,
    updateAudioOnly,
    isLoading: isLoadingExampleFilter,
    error: errorExampleFilter,
  } = useExampleFilterCoordinator();

  // Destructure the course and lesson properties from the coordinator
  const {
    course,
    courseId,
    fromLesson,
    fromLessonNumber,
    toLesson,
    toLessonNumber,
    updateUserSelectedCourseId,
    updateFromLessonNumber,
    updateToLessonNumber,
    isLoading: isLoadingCourseAndLessons,
    error: errorCourseAndLessons,
  } = useSelectedCourseAndLessons();

  const skillTagSearch: UseSkillTagSearchReturnType = useSkillTagSearch();

  // Filter state that always uses lesson ranges
  const filterState: LocalExampleFilters = useMemo(() => {
    const lessonRanges = transformToLessonRanges({
      courseId: course?.id,
      fromLessonNumber: fromLesson?.lessonNumber,
      toLessonNumber: toLesson?.lessonNumber,
    });

    onFilterChange();

    return {
      excludeSpanglish,
      audioOnly,
      skillTags: selectedSkillTags,
      lessonRanges,
    };
  }, [
    excludeSpanglish,
    audioOnly,
    selectedSkillTags,
    course,
    fromLesson,
    toLesson,
  ]);

  // If the selected tags exactly match a preset, return the preset
  const filterPreset: PreSetQuizPreset = useMemo(() => {
    const selectedTagKeys = selectedSkillTags.map((tag) => tag.key).sort();
    const matchingPreset = preSetQuizzes.find((quiz) => {
      const presetTagKeys = [...quiz.SkillTagKeys].sort();
      return (
        selectedTagKeys.length === presetTagKeys.length &&
        selectedTagKeys.every((key, index) => key === presetTagKeys[index])
      );
    });
    if (matchingPreset) {
      return matchingPreset.preset;
    }
    return PreSetQuizPreset.None;
  }, [selectedSkillTags]);

  // Call preset setter functions
  const { setFilterPreset } = usePresetFilters();

  // Load state for the full hook
  const isLoading = useMemo(() => {
    return isLoadingExampleFilter || isLoadingCourseAndLessons;
  }, [isLoadingExampleFilter, isLoadingCourseAndLessons]);

  // Error state for the full hook
  const error = useMemo(() => {
    return errorExampleFilter || errorCourseAndLessons;
  }, [errorExampleFilter, errorCourseAndLessons]);

  return {
    // Headline return: This is everything that is needed for the example filter
    filterState, // Always uses lesson ranges

    // Destructure the filter properties from the filter coordinator
    filterStateWithoutLesson,
    batchUpdateFilterStateWithoutLesson,
    audioOnly,
    updateAudioOnly,
    excludeSpanglish,
    updateExcludeSpanglish,
    selectedSkillTags,
    addSkillTagToFilters,
    removeSkillTagFromFilters,
    bulkUpdateSkillTagKeys,
    skillTagSearch,
    // Destructure the course and lesson properties from the coordinator
    course,
    courseId,
    updateUserSelectedCourseId,
    fromLesson,
    fromLessonNumber,
    updateFromLessonNumber,
    toLesson,
    toLessonNumber,
    updateToLessonNumber,
    filterPreset,
    setFilterPreset,
    // Load state for the full hook
    isLoading,
    error,
  };
}
