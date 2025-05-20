import useMyRecentRecordsQuery from 'src/hooks/CoachingData/queries/CoachingDashboard/useMyRecentRecords';

// month is in the format of 'YYYY:MM'
export default function useMyRecentRecords(monthYear: string) {
  const { myRecentRecordsQuery } = useMyRecentRecordsQuery(monthYear);

  return {
    myRecentRecordsQuery,
    states: {
      isLoading: myRecentRecordsQuery?.isLoading,
      isError: myRecentRecordsQuery?.isError,
      isSuccess: myRecentRecordsQuery?.isSuccess,
    },
  };
}
