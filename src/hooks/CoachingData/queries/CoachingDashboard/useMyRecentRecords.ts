import type { QbUser } from 'src/types/CoachingTypes';
import { useQuery } from '@tanstack/react-query';
import useCoachingDashboardBackend from './BackendFunctions';
import useActiveCoach from 'src/components/CoachingDashboard/hooks/useActiveCoach';

export default function useMyRecentRecordsQuery() {
  const { coach } = useActiveCoach();
  const { getRecentRecords } = useCoachingDashboardBackend();

  const name = coach?.user.name.replace(/\s+/g, '+');
  const myRecentRecordsQuery = useQuery({
    queryKey: ['recent-records', name],
    queryFn: () => getRecentRecords(name),
    enabled: !!name,
    staleTime: Infinity,
  });

  return { myRecentRecordsQuery };
}
