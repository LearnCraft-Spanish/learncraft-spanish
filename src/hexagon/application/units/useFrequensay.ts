import { useQuery } from '@tanstack/react-query';
import { useFrequensayAdapter } from '../adapters/frequensayAdapter';

export function useFrequensay() {
  const adapter = useFrequensayAdapter();

  const { data, isLoading, error } = useQuery({
    queryKey: ['frequensay'],
    queryFn: adapter.getFrequensayVocabulary,
  });

  return { data, isLoading, error };
}
