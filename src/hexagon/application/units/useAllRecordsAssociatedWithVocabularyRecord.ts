import { useQuery } from '@tanstack/react-query';
import { useVocabularyAdapter } from '../adapters/vocabularyAdapter';

export function useAllRecordsAssociatedWithVocabularyRecord(
  id: string | undefined,
) {
  const { getAllRecordsAssociatedWithVocabularyRecord } =
    useVocabularyAdapter();

  const { data, isLoading, error } = useQuery({
    queryKey: ['vocabulary-related-records', id],
    queryFn: () => getAllRecordsAssociatedWithVocabularyRecord(id),
    enabled: !!id,
  });

  return { data, isLoading, error };
}
