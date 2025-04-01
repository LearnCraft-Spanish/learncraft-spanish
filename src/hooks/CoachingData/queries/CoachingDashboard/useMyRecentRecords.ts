import { useQuery } from '@tanstack/react-query';
import useActiveCoach from 'src/components/CoachingDashboard/hooks/useActiveCoach';
import useCoachingDashboardBackend from './BackendFunctions';

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
