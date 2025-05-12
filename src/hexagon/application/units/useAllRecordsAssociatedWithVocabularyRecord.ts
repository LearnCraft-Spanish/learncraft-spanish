import { useQuery } from '@tanstack/react-query';
import { useVocabularyAdapter } from '../adapters/vocabularyAdapter';

export function useAllRecordsAssociatedWithVocabularyRecord(id?: string) {
  const { getAllRecordsAssociatedWithVocabularyRecord } =
    useVocabularyAdapter();

  if (!id) {
    return { data: undefined, isLoading: false, error: null };
  }

  const { data, isLoading, error } = useQuery({
    queryKey: ['vocabulary-related-records', id],
    queryFn: () => getAllRecordsAssociatedWithVocabularyRecord(id),
  });

  return { data, isLoading, error };
}
