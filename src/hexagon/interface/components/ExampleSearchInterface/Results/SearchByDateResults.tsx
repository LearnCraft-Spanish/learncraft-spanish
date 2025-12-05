import { useExamplesByRecentlyModified } from '@application/queries/ExampleQueries/useExamplesByRecentlyModified';
import { BaseResultsComponent } from '@interface/components/ExampleSearchInterface/Results/BaseResultsComponent';

export interface SearchByDateResultsProps {
  _fromDate: string;
  _toDate: string;
}
export function SearchByDateResults({
  _fromDate,
  _toDate,
}: SearchByDateResultsProps) {
  const { examples, isLoading, error } = useExamplesByRecentlyModified(1, 100);
  return (
    <BaseResultsComponent
      isLoading={isLoading}
      error={error ?? null}
      examples={examples}
    />
  );
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
