import { useQuery } from '@tanstack/react-query';
import useActiveCoach from 'src/components/CoachingDashboard/hooks/useActiveCoach';
import useCoachingDashboardBackend from './BackendFunctions';

export default function useMyRecentRecordsQuery(month: string) {
  const { coach } = useActiveCoach();
  const { getRecentRecords } = useCoachingDashboardBackend();
  // format name
  const coachNameFormatted = coach?.coachUserName.replace(' ', '+');
  // format month into 'YYYY-MM'
  const formattedMonth = month.replace(':', '-');
  const myRecentRecordsQuery = useQuery({
    queryKey: ['recent-records', coachNameFormatted, formattedMonth],
    queryFn: () => getRecentRecords(coachNameFormatted, formattedMonth),
    enabled: !!coachNameFormatted,
    staleTime: Infinity,
  });

  return { myRecentRecordsQuery };
}
