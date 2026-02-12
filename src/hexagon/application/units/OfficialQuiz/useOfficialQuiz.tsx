import { useOfficialQuizzesQuery } from '@application/queries/useOfficialQuizzesQuery';
import { useQuizExamplesQuery } from '@application/queries/useQuizExamplesQuery';
import { useMemo } from 'react';
export function useOfficialQuiz({
  courseCode,
  quizNumber,
}: {
  courseCode: string;
  quizNumber: number;
}) {
  const { quizGroups } = useOfficialQuizzesQuery();
  const { quizExamples, isLoading, error } = useQuizExamplesQuery({
    courseCode,
    quizNumber,
  });
  const quizTitle = useMemo(() => {
    const quizGroup = quizGroups?.find((group) => group.urlSlug === courseCode);
    return quizGroup?.quizzes.find((quiz) => quiz.quizNumber === quizNumber)
      ?.quizTitle;
  }, [courseCode, quizNumber, quizGroups]);
  return {
    quizExamples,
    isLoading,
    error,
    quizTitle,
  };
}
