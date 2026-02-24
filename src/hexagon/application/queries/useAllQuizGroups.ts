import type { QuizGroup } from '@learncraft-spanish/shared';
import { useQuizGroupAdapter } from '@application/adapters/quizGroupAdapter';
import { useQuery } from '@tanstack/react-query';

export interface UseAllQuizGroupsReturn {
  quizGroups: QuizGroup[] | undefined;
  isLoading: boolean;
  error: Error | null;
}

export function useAllQuizGroups(): UseAllQuizGroupsReturn {
  const { getAllQuizGroups } = useQuizGroupAdapter();
  const { data, isLoading, error } = useQuery({
    queryKey: ['allQuizGroups'],
    queryFn: getAllQuizGroups,
  });
  return { quizGroups: data, isLoading, error };
}
