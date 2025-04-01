import { useQuery } from '@tanstack/react-query';
import useActiveCoach from 'src/components/CoachingDashboard/hooks/useActiveCoach';
import useCoachingDashboardBackend from './BackendFunctions';

export default function useMyRecentRecordsQuery(month: number) {
  const { coach } = useActiveCoach();
  const { getRecentRecords } = useCoachingDashboardBackend();

  const name = coach?.user.name.replace(/\s+/g, '+');
  const myRecentRecordsQuery = useQuery({
    queryKey: ['recent-records', name, month],
    queryFn: () => getRecentRecords(name, month),
    enabled: !!name,
    staleTime: Infinity,
  });

  return { myRecentRecordsQuery };
}
