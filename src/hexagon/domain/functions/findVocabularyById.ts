import type { Vocabulary } from '@learncraft-spanish/shared';

/**
 * Finds a single Vocabulary record by id within an already-fetched catalog.
 *
 * There is no backend endpoint to fetch one vocabulary record by id, so
 * callers (see `useAllVocabulary`) fetch the full catalog and select from it
 * client-side. Returns null when the catalog hasn't loaded yet, no id is
 * selected, or the id isn't present.
 */
export function findVocabularyById(
  vocabulary: Vocabulary[] | undefined,
  id: number | null,
): Vocabulary | null {
  if (!vocabulary || id === null) {
    return null;
  }

  return vocabulary.find((item) => item.id === id) ?? null;
}
