import { useQuery } from '@tanstack/react-query';
import useActiveCoach from 'src/components/CoachingDashboard/hooks/useActiveCoach';
import useCoachingDashboardBackend from './BackendFunctions';

export default function useMyRecentRecordsQuery(month: string) {
  const { coach } = useActiveCoach();
  const { getRecentRecords } = useCoachingDashboardBackend();
  // format name
  const name = coach?.user.name.replace(/\s+/g, '+');
  // format month into 'YYYY-MM'
  const formattedMonth = month.replace(':', '-');
  const myRecentRecordsQuery = useQuery({
    queryKey: ['recent-records', name, formattedMonth],
    queryFn: () => getRecentRecords(name, formattedMonth),
    enabled: !!name,
    staleTime: Infinity,
  });

  return { myRecentRecordsQuery };
}
