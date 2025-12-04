import { useExampleAdapter } from '@application/adapters/exampleAdapter';
import { BaseResultsComponent } from '@interface/components/ExampleSearchInterface/Results/BaseResultsComponent';
import { useQuery } from '@tanstack/react-query';

export interface SearchByTextsOrIdsResultsProps {
  mode: 'spanish' | 'english' | 'ids';
  array: string[] | number[];
}
export function SearchByTextsOrIdsResults({
  mode,
  array,
}: SearchByTextsOrIdsResultsProps) {
  if (mode === 'ids') {
    return <SearchByIdsResults ids={array as number[]} />;
  }
  if (mode === 'spanish' || mode === 'english') {
    return (
      <SearchByStrings _spanishOrEnglish={mode} _strings={array as string[]} />
    );
  }
  return null;
}

export function SearchByIdsResults({ ids }: { ids: number[] }) {
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
      examples={results?.examples}
    />
  );
}

export function SearchByStrings({
  _spanishOrEnglish,
  _strings,
}: {
  _spanishOrEnglish: 'spanish' | 'english';
  _strings: string[];
}) {
  // const { getExamplesByStrings } = useExampleAdapter();
  // const {
  //   data: results,
  //   isLoading,
  //   error,
  // } = useQuery({
  //   queryKey: ['examples', 'by strings', spanishOrEnglish, strings],
  //   queryFn: () => getExamplesByStrings(spanishOrEnglish, strings),
  // });
  // return (
  //   <BaseResultsComponent
  //     isLoading={isLoading}
  //     error={error ?? null}
  //     examples={results?.examples}
  //   />
  // );
  return <p>Search by strings not implemented yet</p>;
}
