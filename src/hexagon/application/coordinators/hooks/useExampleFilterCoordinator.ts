import type { ExampleFilters, SkillTag } from '@learncraft-spanish/shared';
import { ExampleFilterContext } from '@application/coordinators/contexts/ExampleFilterContext';
import { use, useCallback, useMemo } from 'react';
import { useSkillTags } from '../../queries/useSkillTags';
import { useSelectedCourseAndLessons } from './useSelectedCourseAndLessons';

export interface UseExampleFilterCoordinatorReturnType {
  filterState: ExampleFilters;
  addSkillTagToFilters: (tagKey: string) => void;
  removeSkillTagFromFilters: (tagKey: string) => void;
  updateIncludeSpanglish: (includeSpanglish: boolean) => void;
  updateAudioOnly: (audioOnly: boolean) => void;
}

export function useExampleFilterCoordinator(): UseExampleFilterCoordinatorReturnType {
  const { exampleFilters, updateExampleFilters } = use(ExampleFilterContext);
  const { course, fromLesson, toLesson } = useSelectedCourseAndLessons();
  const { skillTags, isLoading } = useSkillTags();

  const courseId = course?.id;
  const fromLessonNumber = fromLesson?.lessonNumber;
  const toLessonNumber = toLesson?.lessonNumber;

  const selectedSkillTags: SkillTag[] = useMemo(() => {
    if (isLoading) {
      return [];
    }
    return (
      skillTags?.filter((tag) =>
        exampleFilters.skillTagKeys.includes(tag.key),
      ) ?? []
    );
  }, [skillTags, exampleFilters.skillTagKeys, isLoading]);

  const filterState: ExampleFilters = useMemo(() => {
    const filters: ExampleFilters = {
      includeSpanglish: exampleFilters.includeSpanglish,
      audioOnly: exampleFilters.audioOnly,
      skillTags: selectedSkillTags,
      courseId,
      fromLessonNumber,
      toLessonNumber,
    };
    return filters;
  }, [
    exampleFilters,
    courseId,
    fromLessonNumber,
    toLessonNumber,
    selectedSkillTags,
  ]);

  const addSkillTagToFilters = useCallback(
    (tagKey: string) => {
      updateExampleFilters({
        ...exampleFilters,
        skillTagKeys: [...exampleFilters.skillTagKeys, tagKey],
      });
    },
    [exampleFilters, updateExampleFilters],
  );

  const removeSkillTagFromFilters = useCallback(
    (keyToRemove: string) => {
      updateExampleFilters({
        ...exampleFilters,
        skillTagKeys: exampleFilters.skillTagKeys.filter(
          (tagKey) => tagKey !== keyToRemove,
        ),
      });
    },
    [exampleFilters, updateExampleFilters],
  );

  const updateIncludeSpanglish = useCallback(
    (includeSpanglish: boolean) => {
      updateExampleFilters({ ...exampleFilters, includeSpanglish });
    },
    [exampleFilters, updateExampleFilters],
  );

  const updateAudioOnly = useCallback(
    (audioOnly: boolean) => {
      updateExampleFilters({ ...exampleFilters, audioOnly });
    },
    [exampleFilters, updateExampleFilters],
  );

  return {
    filterState,
    addSkillTagToFilters,
    removeSkillTagFromFilters,
    updateIncludeSpanglish,
    updateAudioOnly,
  };
}
