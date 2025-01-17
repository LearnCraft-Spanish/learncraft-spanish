import { useQuery } from '@tanstack/react-query';
import { useBackend } from 'src/hooks/useBackend';
import { useUserData } from 'src/hooks/UserData/useUserData';

export function useAudioExamples() {
  const userDataQuery = useUserData();
  const { getAudioExamplesFromBackend } = useBackend();

  const audioExamplesQuery = useQuery({
    queryKey: ['audioExamples'],
    queryFn: getAudioExamplesFromBackend,
    staleTime: Infinity,
    enabled: !!userDataQuery.isSuccess,
  });

  return { audioExamplesQuery };
}
