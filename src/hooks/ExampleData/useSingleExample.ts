import { useQuery } from '@tanstack/react-query';
import useExampleManagerLegacyDataFunctions from '../ExampleManagerLegacyDataFunctions';

export function useSingleExample(exampleId: number) {
  const { getSingleExample } = useExampleManagerLegacyDataFunctions();

  const singleExampleQuery = useQuery({
    queryKey: ['singleExample', exampleId],
    queryFn: () => getSingleExample(exampleId),
    staleTime: Infinity,
    gcTime: Infinity,
    enabled: !!exampleId,
  });

  return { singleExampleQuery };
}
