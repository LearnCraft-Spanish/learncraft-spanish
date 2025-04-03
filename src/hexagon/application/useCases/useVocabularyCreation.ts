import type { Subcategory } from '@Learncraft-spanish/shared/src/domain/vocabulary/core-types';
import { useCallback, useState } from 'react';
import { useSubcategories } from '../units/useSubcategories';

interface UseVocabularyCreationResult {
  // Subcategory selection
  subcategories: Subcategory[];
  loadingSubcategories: boolean;
  selectedSubcategoryId: string;
  setSelectedSubcategoryId: (id: string) => void;

  // Creation status
  creating: boolean;
  creationError: Error | null;

  // Creation methods
  createVocabularyBatch: (data: any[]) => Promise<boolean>;
}

/**
 * Use case for vocabulary creation that composes unit hooks.
 * Orchestrates the vocabulary creation flow with subcategory selection.
 */
export function useVocabularyCreation(): UseVocabularyCreationResult {
  // State
  const [selectedSubcategoryId, setSelectedSubcategoryId] = useState('');
  const [creating, setCreating] = useState(false);
  const [creationError, setCreationError] = useState<Error | null>(null);

  // Compose unit hooks
  const { subcategories, loading: loadingSubcategories } = useSubcategories();

  // Create vocabulary batch
  const createVocabularyBatch = useCallback(
    async (data: any[]) => {
      if (!selectedSubcategoryId) {
        setCreationError(new Error('No subcategory selected'));
        return false;
      }

      try {
        setCreating(true);
        setCreationError(null);

        // TODO: Replace with actual API call when infrastructure is ready
        console.error(
          `Creating vocabulary batch with subcategory: ${selectedSubcategoryId}`,
        );
        console.error('Data:', data);

        // Simulate API delay
        await new Promise((resolve) => setTimeout(resolve, 1000));

        return true;
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err));
        setCreationError(error);
        return false;
      } finally {
        setCreating(false);
      }
    },
    [selectedSubcategoryId],
  );

  return {
    // Subcategory selection
    subcategories,
    loadingSubcategories,
    selectedSubcategoryId,
    setSelectedSubcategoryId,

    // Creation status
    creating,
    creationError,

    // Creation methods
    createVocabularyBatch,
  };
}
