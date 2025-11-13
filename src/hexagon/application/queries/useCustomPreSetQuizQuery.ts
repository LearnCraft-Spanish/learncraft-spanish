import { useExampleAdapter } from '@application/adapters/exampleAdapter';
import { useSelectedCourseAndLessons } from '@application/coordinators/hooks/useSelectedCourseAndLessons';
import { useSkillTags } from '@application/queries/useSkillTags';
import { transformToLessonRanges } from '@domain/coursePrerequisites';
import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { v4 as uuidv4 } from 'uuid';

export function useCustomPreSetQuizQuery({
  quizTitle,
  quizSkillTagKeys,
}: {
  quizTitle: string;
  quizSkillTagKeys: string[];
}) {
  const exampleAdapter = useExampleAdapter();
  const { course, toLesson, fromLesson } = useSelectedCourseAndLessons();

  const skillTags = useSkillTags();

  const skillTagsForQuiz = useMemo(() => {
    return skillTags.skillTags?.filter((tag) =>
      quizSkillTagKeys.includes(tag.key),
    );
  }, [skillTags, quizSkillTagKeys]);

  // Transform lesson selection to handle virtual prerequisites
  const lessonRanges = useMemo(() => {
    return transformToLessonRanges({
      courseId: course?.id,
      fromLessonNumber: fromLesson?.lessonNumber,
      toLessonNumber: toLesson?.lessonNumber,
    });
  }, [course, fromLesson, toLesson]);

  const { data, isLoading, error } = useQuery({
    queryKey: ['customPreSetQuiz', quizTitle, lessonRanges],
    queryFn: () =>
      exampleAdapter.getFilteredExamples({
        lessonRanges,
        excludeSpanglish: false,
        audioOnly: false,
        skillTags: skillTagsForQuiz,
        page: 1,
        limit: 150,
        seed: uuidv4(),
      }),
    enabled: !!course && !!toLesson,
  });

  return {
    quizExamples: data?.examples,
    isLoading,
    error,
  };
}
