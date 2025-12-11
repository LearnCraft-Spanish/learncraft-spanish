import { useOfficialQuizzesQuery } from '@application/queries/useOfficialQuizzesQuery';
import { useMemo } from 'react';

export interface UseSearchByQuizFilterParams {
  courseCode: string;
}

export function useSearchByQuizFilter({
  courseCode,
}: UseSearchByQuizFilterParams) {
  const {
    officialQuizRecords,
    isLoading: officialQuizzesLoading,
    error,
  } = useOfficialQuizzesQuery();

  // quizOptions are the quizzes for the selected course
  const quizOptions = useMemo(() => {
    if (!officialQuizRecords || officialQuizzesLoading || error) {
      return [];
    }
    const filteredQuizzes = officialQuizRecords.filter(
      (quiz) => quiz.courseCode === courseCode,
    );
    return filteredQuizzes;
  }, [courseCode, officialQuizRecords, officialQuizzesLoading, error]);

  return {
    quizOptions,
    isLoading: officialQuizzesLoading,
    error,
  };
}
