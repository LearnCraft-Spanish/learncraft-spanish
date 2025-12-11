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
}
