import { useAllQuizGroups } from '@application/queries/useAllQuizGroups';
import { useMemo } from 'react';
export interface UseSearchByQuizFilterParams {
  quizGroupId: number | undefined;
}

export function useSearchByQuizFilter({
  quizGroupId,
}: UseSearchByQuizFilterParams) {
  const {
    quizGroups,
    isLoading: isLoadingQuizGroups,
    error,
  } = useAllQuizGroups();

  // quizOptions are the quizzes for the selected course
  const quizOptions = useMemo(() => {
    if (!quizGroups || isLoadingQuizGroups || error) {
      return [];
    }
    const quizGroup = quizGroups?.find((group) => group.id === quizGroupId);
    return quizGroup?.quizzes ?? [];
  }, [quizGroupId, quizGroups, isLoadingQuizGroups, error]);

  return {
    quizOptions,
    isLoading: isLoadingQuizGroups,
    error,
  };
}
