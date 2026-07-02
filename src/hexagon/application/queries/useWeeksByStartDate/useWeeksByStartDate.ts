import type { FurnishedWeekWithCoach } from '@learncraft-spanish/shared';
import { useWeeklyRecordsAdapter } from '@application/adapters/weeklyRecordsAdapter';
import {
  normalizeQueryError,
  queryDefaults,
} from '@application/utils/queryUtils';
import { useQuery } from '@tanstack/react-query';

export interface UseWeeksByStartDateResult {
  weeks: FurnishedWeekWithCoach[];
  loading: boolean;
  error: Error | null;
  refetch: () => void;
}

export function useWeeksByStartDate(
  startDate: string,
): UseWeeksByStartDateResult {
  const { getWeeksByStartDate } = useWeeklyRecordsAdapter();

  const {
    data = [],
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['weeklyRecords', 'weeksByStartDate', startDate],
    queryFn: () => getWeeksByStartDate(startDate),
    enabled: startDate.length > 0,
    ...queryDefaults.entityData,
  });

  return {
    weeks: data,
    loading: isLoading,
    error: normalizeQueryError(error),
    refetch,
  };
}
