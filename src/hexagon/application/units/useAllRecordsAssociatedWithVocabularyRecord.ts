import { useQuery } from '@tanstack/react-query';
import { useVocabularyAdapter } from '../adapters/vocabularyAdapter';

export function useAllRecordsAssociatedWithVocabularyRecord(
  id: number | undefined,
) {
  const { getRelatedRecords } = useVocabularyAdapter();

  const { data, isLoading, error } = useQuery({
    queryKey: ['vocabulary-related-records', id],
    queryFn: () => getRelatedRecords(id!),
    enabled: !!id,
  });

  return { data, isLoading, error };
}
