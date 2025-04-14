import { useQuery } from '@tanstack/react-query';
import useActiveCoach from 'src/components/CoachingDashboard/hooks/useActiveCoach';
import useCoachingDashboardBackend from './BackendFunctions';

export default function useMyRecentRecordsQuery(month: string) {
  const { coach } = useActiveCoach();
  const { getRecentRecords } = useCoachingDashboardBackend();
  // format name
  const coachId = coach?.user.id;
  // format month into 'YYYY-MM'
  const formattedMonth = month.replace(':', '-');
  const myRecentRecordsQuery = useQuery({
    queryKey: ['recent-records', coachId, formattedMonth],
    queryFn: () => getRecentRecords(coachId, formattedMonth),
    enabled: !!coachId,
    staleTime: Infinity,
  });

  return { myRecentRecordsQuery };
}
