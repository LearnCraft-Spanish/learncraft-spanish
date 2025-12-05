import { useExampleAdapter } from '@application/adapters/exampleAdapter';
import { BaseResultsComponent } from '@interface/components/ExampleSearchInterface/Results/BaseResultsComponent';
import { useQuery } from '@tanstack/react-query';

export interface SearchByIdsResultsProps {
  ids: number[];
}

export function SearchByIdsResults({ ids }: SearchByIdsResultsProps) {
  const { getExamplesByIds } = useExampleAdapter();
  const {
    data: results,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['examples', 'by ids', ids],
    queryFn: () => getExamplesByIds(ids),
  });
  return (
    <BaseResultsComponent
      isLoading={isLoading}
      error={error ?? null}
      examples={results ?? undefined}
    />
  );
}
