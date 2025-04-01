import useMyRecentRecordsQuery from 'src/hooks/CoachingData/queries/CoachingDashboard/useMyRecentRecords';

export default function useMyRecentRecords() {
  const { myRecentRecordsQuery } = useMyRecentRecordsQuery();

  return {
    myRecentRecordsQuery,
    states: {
      isLoading: myRecentRecordsQuery?.isLoading,
      isError: myRecentRecordsQuery?.isError,
      isSuccess: myRecentRecordsQuery?.isSuccess,
    },
  };
}
