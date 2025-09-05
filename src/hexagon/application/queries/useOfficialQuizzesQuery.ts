import { useOfficialQuizAdapter } from '@application/adapters/officialQuizAdapter';
import { useQuery } from '@tanstack/react-query';

export function useOfficialQuizzesQuery() {
  const { getOfficialQuizRecords } = useOfficialQuizAdapter();

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
