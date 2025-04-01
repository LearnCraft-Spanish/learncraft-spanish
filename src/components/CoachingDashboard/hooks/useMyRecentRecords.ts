import useMyRecentRecordsQuery from 'src/hooks/CoachingData/queries/CoachingDashboard/useMyRecentRecords';

export default function useMyRecentRecords(month: number) {
  const { myRecentRecordsQuery } = useMyRecentRecordsQuery(month);

  return {
    myRecentRecordsQuery,
    states: {
      isLoading: myRecentRecordsQuery?.isLoading,
      isError: myRecentRecordsQuery?.isError,
      isSuccess: myRecentRecordsQuery?.isSuccess,
    },
  };
}
