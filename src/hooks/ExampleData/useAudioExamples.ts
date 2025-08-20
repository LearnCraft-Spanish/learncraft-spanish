import { useAuthAdapter } from '@application/adapters/authAdapter';
import { useQuery } from '@tanstack/react-query';
import { useBackend } from 'src/hooks/useBackend';

export function useAudioExamples() {
  const { isAuthenticated } = useAuthAdapter();
  const { getAudioExamplesFromBackend } = useBackend();

  const audioExamplesQuery = useQuery({
    queryKey: ['audioExamples'],
    queryFn: getAudioExamplesFromBackend,
    staleTime: Infinity,
    enabled: isAuthenticated,
  });

  return { audioExamplesQuery };
}
