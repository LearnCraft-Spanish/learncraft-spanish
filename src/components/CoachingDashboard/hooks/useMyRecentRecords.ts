import useMyRecentRecordsQuery from 'src/hooks/CoachingData/queries/CoachingDashboard/useMyRecentRecords';

// month is in the format of 'YYYY:MM'
export default function useMyRecentRecords(month: string) {
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
