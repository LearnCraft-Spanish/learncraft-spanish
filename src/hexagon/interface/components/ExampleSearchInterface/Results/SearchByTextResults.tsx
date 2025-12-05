import { useExampleAdapter } from '@application/adapters/exampleAdapter';
import { BaseResultsComponent } from '@interface/components/ExampleSearchInterface/Results/BaseResultsComponent';
import { useQuery } from '@tanstack/react-query';

export interface SearchByTextResultsProps {
  spanishString: string;
  englishString: string;
}

export function SearchByTextResults({
  spanishString,
  englishString,
}: SearchByTextResultsProps) {
  const { searchExamplesByText } = useExampleAdapter();
  const {
    data: results,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['examples', 'by text', spanishString, englishString],
    queryFn: () =>
      searchExamplesByText(
        {
          spanishText: spanishString,
          englishText: englishString,
        },
        1,
        150,
      ),
  });
  return (
    <BaseResultsComponent
      isLoading={isLoading}
      error={error ?? null}
      examples={results}
    />
  );
  // return <p>Search by text not implemented yet</p>;
}
