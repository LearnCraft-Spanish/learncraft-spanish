import type { OfficialQuizRecord } from '@learncraft-spanish/shared';
import { useOfficialQuizAdapter } from '@application/adapters/officialQuizAdapter';
import { useQuery } from '@tanstack/react-query';

export interface UseOfficialQuizzesQueryReturn {
  officialQuizRecords: OfficialQuizRecord[] | undefined;
  isLoading: boolean;
  error: Error | null;
}
export function useOfficialQuizzesQuery(): UseOfficialQuizzesQueryReturn {
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
