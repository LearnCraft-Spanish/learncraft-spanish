import type { Vocabulary } from '@learncraft-spanish/shared';
import { useVocabularyAdapter } from '@application/adapters/vocabularyAdapter';
import {
  normalizeQueryError,
  queryDefaults,
} from '@application/utils/queryUtils';
import { useQuery } from '@tanstack/react-query';

export interface UseAllVocabularyResult {
  vocabulary: Vocabulary[];
  loading: boolean;
  error: Error | null;
  refetch: () => void;
}

/**
 * Fetches the full Vocabulary catalog (`GET /api/vocabulary` -- includes
 * both verb and nonverb records; idioms are nonverb records under the
 * "Cluster, Idiom" subcategory). There is no backend endpoint to fetch a
 * single vocabulary record by id, so callers that need one record -- e.g.
 * vocab lookup resolving a skill-tag selection -- fetch the whole catalog
 * and select from it (see `domain/functions/findVocabularyById`).
 *
 * Shares the `['vocabulary']` query key with the `useVocabulary` unit hook
 * (admin vocabulary management) so the two surfaces share one cache entry
 * instead of double-fetching the catalog.
 */
export function useAllVocabulary(): UseAllVocabularyResult {
  const { getVocabulary } = useVocabularyAdapter();

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['vocabulary'],
    queryFn: () => getVocabulary(),
    ...queryDefaults.referenceData,
  });

  return {
    vocabulary: data ?? [],
    loading: isLoading,
    error: normalizeQueryError(error),
    refetch,
  };
}
