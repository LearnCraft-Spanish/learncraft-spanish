import { useMemo } from 'react';
import { useOfficialQuizzesQuery } from '../../queries/useOfficialQuizzesQuery';
import { useQuizExamplesQuery } from '../../queries/useQuizExamplesQuery';
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
    quizExamples,
    isLoading,
    error,
    quizTitle,
  };
}
