export interface SearchByDateResultsProps {
  _fromDate: string;
  _toDate: string;
}
export function SearchByDateResults({
  _fromDate,
  _toDate,
}: SearchByDateResultsProps) {
  // const { getExamplesByDateRange } = useExampleAdapter();
  // const {
  //   data: results,
  //   isLoading,
  //   error,
  // } = useQuery({
  //   queryKey: ['examples', 'by date range', fromDate, toDate],
  //   queryFn: () => getExamplesByDateRange(fromDate, toDate),
  // });
  // return (
  //   <BaseResultsComponent
  //     isLoading={isLoading}
  //     error={error ?? null}
  //     examples={results?.examples}
  //   />
  // );
  return <p>Search by date not implemented yet</p>;
}
