import { useQuery } from '@tanstack/react-query';
import { useBackend } from '../useBackend';

export function useSingleExample(exampleId: number) {
  const { getSingleExample } = useBackend();

  const singleExampleQuery = useQuery({
    queryKey: ['singleExample', exampleId],
    queryFn: () => getSingleExample(exampleId),
    staleTime: Infinity,
    gcTime: Infinity,
    enabled: !!exampleId,
  });

  return { singleExampleQuery };
}
