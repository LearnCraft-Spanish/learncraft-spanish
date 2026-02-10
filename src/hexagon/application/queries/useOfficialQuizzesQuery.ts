import type { OfficialQuizRecord, QuizGroup } from '@learncraft-spanish/shared';
import { useOfficialQuizAdapter } from '@application/adapters/officialQuizAdapter';
import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';

export interface UseOfficialQuizzesQueryReturn {
  quizGroups: QuizGroup[] | undefined;
  officialQuizRecords: OfficialQuizRecord[] | undefined;
  isLoading: boolean;
  error: Error | null;
}
export function useOfficialQuizzesQuery(): UseOfficialQuizzesQueryReturn {
  const { getOfficialQuizGroups } = useOfficialQuizAdapter();

  const quizGroupsQuery = useQuery({
    queryKey: ['OfficialQuizGroups'],
    queryFn: getOfficialQuizGroups,
    staleTime: Infinity,
  });

  // Flatten all quizzes from all quiz groups for backward compatibility
  const officialQuizRecords = useMemo(() => {
    if (!quizGroupsQuery.data) return undefined;
    return quizGroupsQuery.data.flatMap((group) => group.quizzes);
  }, [quizGroupsQuery.data]);

  return {
    quizGroups: quizGroupsQuery.data,
    officialQuizRecords,
    isLoading: quizGroupsQuery.isLoading,
    error: quizGroupsQuery.error,
  };
}
