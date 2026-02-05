import type { CoachCallCount } from '@learncraft-spanish/shared';
import { useCoachAdapter } from '@application/adapters/coachAdapter';
import { useQuery } from '@tanstack/react-query';

export interface UseAllCoachesByStudentReturnType {
  data: CoachCallCount[];
  isLoading: boolean;
  error: Error | null;
}

export function useAllCoachesByStudent(studentId: number) {
  const coachAdapter = useCoachAdapter();
  const { data, isLoading, error } = useQuery({
    queryKey: ['allCoachesByStudent', studentId],
    queryFn: () => coachAdapter.getAllCoachesByStudent(studentId),
    enabled: studentId > 0,
  });
  return { data, isLoading, error };
}
