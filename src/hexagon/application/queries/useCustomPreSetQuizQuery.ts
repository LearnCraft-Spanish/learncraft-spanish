import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { useExampleAdapter } from '../adapters/exampleAdapter';
import { useSelectedCourseAndLessons } from '../coordinators/hooks/useSelectedCourseAndLessons';
import { useSkillTags } from './useSkillTags';

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

  const { data, isLoading, error } = useQuery({
    queryKey: ['customPreSetQuiz', quizTitle],
    queryFn: () =>
      exampleAdapter.getFilteredExamples({
        courseId: course!.id,
        toLessonNumber: toLesson!.lessonNumber,
        fromLessonNumber: fromLesson?.lessonNumber,
        excludeSpanglish: false,
        audioOnly: false,
        skillTags: skillTagsForQuiz,
        page: 1,
        limit: 150,
        seed: uuidv4(),
      }),
  });

  return {
    quizExamples: data?.examples,
    isLoading,
    error,
  };
}
