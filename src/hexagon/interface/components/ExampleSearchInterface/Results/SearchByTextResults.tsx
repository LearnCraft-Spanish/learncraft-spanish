import { useSearchByTextResults } from '@application/units/ExampleSearchInterface/Results/useSearchByTextResults';
import { BaseResultsComponent } from '@interface/components/ExampleSearchInterface/Results/BaseResultsComponent';

export interface SearchByTextResultsProps {
  spanishString: string;
  englishString: string;
}

export function SearchByTextResults({
  spanishString,
  englishString,
}: SearchByTextResultsProps) {
  const { examples, isLoading, error } = useSearchByTextResults({
    spanishString,
    englishString,
  });

  return (
    <BaseResultsComponent
      isLoading={isLoading}
      error={error}
      examples={examples}
    />
  );
}
