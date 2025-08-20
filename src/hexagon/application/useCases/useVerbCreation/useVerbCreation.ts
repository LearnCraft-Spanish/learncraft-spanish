import type { CreateVerbVocabulary } from '@learncraft-spanish/shared';
import type { UseVerbCreationResult } from './useVerbCreation.types';
import { useSubcategories } from '@application/queries/useSubcategories';
import { useVocabularyQuery } from '@application/queries/useVocabularyQuery';
import { useCallback, useMemo, useState } from 'react';

/**
 * Use case for verb creation.
 * Manages verb-specific creation flow with proper subcategory filtering.
 */
export default function useVerbCreation(): UseVerbCreationResult {
  // State
  const [selectedSubcategoryId, setSelectedSubcategoryId] = useState<number>(0);
  const [creationError, setCreationError] = useState<Error | null>(null);

  // Compose unit hooks
  const { subcategories: allSubcategories, loading: loadingSubcategories } =
    useSubcategories();

  // Use our vocabulary unit for operations
  const {
    createVocabulary: createVerbInVocabulary,
    creating: creatingVocabulary,
    creationError: vocabCreationError,
  } = useVocabularyQuery(selectedSubcategoryId, 150);

  // Filter for verb subcategories only
  const verbSubcategories = useMemo(() => {
    return allSubcategories.filter((subcategory) => {
      // Check if this is likely a verb subcategory
      const name = subcategory.name?.toLowerCase() || '';
      return name.includes('verb') || name.includes('action');
    });
  }, [allSubcategories]);

  // Create verb
  const createVerbVocabulary = useCallback(
    async (verbData: CreateVerbVocabulary[]) => {
      try {
        // Use our new vocabulary unit to create the verb
        const createdIds = await createVerbInVocabulary(verbData);
        return createdIds;
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err));
        setCreationError(error);
        return [];
      }
    },
    [createVerbInVocabulary],
  );

  // Combine errors from both sources
  const combinedError = creationError || vocabCreationError;

  return {
    // Subcategory selection
    verbSubcategories,
    loadingSubcategories,
    selectedSubcategoryId,
    setSelectedSubcategoryId,

    // Creation status
    creating: creatingVocabulary,
    creationError: combinedError,

    // Creation methods
    createVerbVocabulary,
  };
}
