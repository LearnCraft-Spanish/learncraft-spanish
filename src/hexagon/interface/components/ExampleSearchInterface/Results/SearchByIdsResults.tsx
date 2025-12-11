import { useSearchByIdsResults } from '@application/units/ExampleSearchInterface/Results/useSearchByIdsResults';
import { BaseResultsComponent } from '@interface/components/ExampleSearchInterface/Results/BaseResultsComponent';

export interface SearchByIdsResultsProps {
  ids: number[];
}

export function SearchByIdsResults({ ids }: SearchByIdsResultsProps) {
  const { examples, isLoading, error } = useSearchByIdsResults({ ids });

  return (
    <BaseResultsComponent
      isLoading={isLoading}
      error={error}
      examples={examples}
    />
  );
}
