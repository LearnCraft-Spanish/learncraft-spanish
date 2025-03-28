import type { QbUser } from 'src/types/CoachingTypes';
import useMyRecentRecordsQuery from 'src/hooks/CoachingData/queries/CoachingDashboard/useMyRecentRecords';

export default function useMyRecentRecords({
  coach,
}: {
  coach: QbUser | undefined;
}) {
  const { myRecentRecordsQuery } = useMyRecentRecordsQuery({ coach });

  return {
    myRecentRecordsQuery,
    states: {
      isLoading: myRecentRecordsQuery.isLoading,
      isError: myRecentRecordsQuery.isError,
      isSuccess: myRecentRecordsQuery.isSuccess,
    },
  };
}
