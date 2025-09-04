import { useQuizAdapter } from '@application/adapters/quizAdapter';
import { useQuery } from '@tanstack/react-query';

export function useOfficialQuizzesQuery() {
  const { getOfficialQuizRecords } = useQuizAdapter();

  const officialQuizRecordsQuery = useQuery({
    queryKey: ['officialQuizzes'],
    queryFn: getOfficialQuizRecords,
    staleTime: Infinity,
  });

  return {
    officialQuizRecords: officialQuizRecordsQuery.data,
    isLoading: officialQuizRecordsQuery.isLoading,
    error: officialQuizRecordsQuery.error,
  };
}
