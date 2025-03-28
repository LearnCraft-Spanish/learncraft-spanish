import type { QbUser } from 'src/types/CoachingTypes';
import { useQuery } from '@tanstack/react-query';
import useCoachingDashboardBackend from './BackendFunctions';

export default function useMyRecentRecordsQuery({
  coach,
}: {
  coach: QbUser | undefined;
}) {
  const { getRecentRecords } = useCoachingDashboardBackend();

  const myRecentRecordsQuery = useQuery({
    queryKey: ['recent-records', coach?.name],
    queryFn: () => getRecentRecords(coach?.name),
    enabled: !!coach?.name,
    staleTime: Infinity,
  });

  return { myRecentRecordsQuery };
}
