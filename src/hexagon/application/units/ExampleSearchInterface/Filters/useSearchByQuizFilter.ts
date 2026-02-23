import { useOfficialQuizzesQuery } from '@application/queries/useOfficialQuizzesQuery';
import { useMemo } from 'react';

export interface UseSearchByQuizFilterParams {
  courseCode: string;
}

export function useSearchByQuizFilter({
  courseCode,
}: UseSearchByQuizFilterParams) {
  const {
    quizGroups,
    officialQuizRecords,
    isLoading: officialQuizzesLoading,
    error,
  } = useOfficialQuizzesQuery();

  // quizOptions are the quizzes for the selected course
  const quizOptions = useMemo(() => {
    if (!officialQuizRecords || officialQuizzesLoading || error) {
      return [];
    }
    const quizGroup = quizGroups?.find((group) => group.urlSlug === courseCode);
    return quizGroup?.quizzes ?? [];
  }, [
    courseCode,
    quizGroups,
    error,
    officialQuizzesLoading,
    officialQuizRecords,
  ]);

  return {
    quizOptions,
    isLoading: officialQuizzesLoading,
    error,
  };
}
