import { useQuery } from '@tanstack/react-query';
import useActiveCoach from 'src/components/CoachingDashboard/hooks/useActiveCoach';
import useCoachingDashboardBackend from './BackendFunctions';

export default function useMyRecentRecordsQuery(monthYear: string) {
  const { coach } = useActiveCoach();
  const { getRecentRecords } = useCoachingDashboardBackend();
  // format name
  const coachNameFormatted = coach?.coachUserName.replace(' ', '+');
  // format month into 'YYYY-MM'
  const formattedDate = monthYear.replace(':', '-');
  const myRecentRecordsQuery = useQuery({
    queryKey: ['recent-records', coachNameFormatted, formattedDate],
    queryFn: () => getRecentRecords(coachNameFormatted, formattedDate),
    enabled: !!coachNameFormatted,
    staleTime: Infinity,
  });

  return { myRecentRecordsQuery };
}
