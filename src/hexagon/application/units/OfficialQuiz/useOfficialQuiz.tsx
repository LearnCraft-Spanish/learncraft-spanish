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
  const { officialQuizRecords } = useOfficialQuizzesQuery();
  const { quizExamples, isLoading, error } = useQuizExamplesQuery({
    courseCode,
    quizNumber,
  });
  const quizTitle = useMemo(() => {
    // identify quiz record by courseCode and quizNumber
    const quizRecord = officialQuizRecords?.find(
      (quiz) =>
        quiz.courseCode === courseCode && quiz.quizNumber === quizNumber,
    );
    return quizRecord?.quizTitle;
  }, [courseCode, quizNumber, officialQuizRecords]);
  return {
    officialQuizRecords,
    quizExamples,
    isLoading,
    error,
    quizTitle,
  };
}
