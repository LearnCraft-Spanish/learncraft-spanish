import { useQuery } from '@tanstack/react-query';
import { useBackend } from './useBackend';
import { useUserData } from './useUserData';

export function useLastThreeWeeks() {
  const userDataQuery = useUserData();
  const { getNewWeeks } = useBackend();

  const lastThreeWeeksQuery = useQuery({
    queryKey: ['lastThreeWeeks'],
    queryFn: getNewWeeks,
    staleTime: Infinity,
    enabled: !!userDataQuery.data?.isAdmin,
  });

  return { lastThreeWeeksQuery };
}
