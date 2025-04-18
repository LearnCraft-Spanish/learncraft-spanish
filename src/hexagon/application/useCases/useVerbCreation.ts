import type { CreateVerb, Subcategory } from '@LearnCraft-Spanish/shared';
import { useCallback, useMemo, useState } from 'react';
import { useSubcategories } from '../units/useSubcategories';
import { useVocabulary } from '../units/useVocabulary';

interface VerbData {
  infinitive: string;
  translation: string;
  usage?: string;
  subcategoryId: string;
  isRegular?: boolean;
  notes?: string;
}

interface UseVerbCreationResult {
  // Subcategory selection
  verbSubcategories: Subcategory[]; // Now using proper type
  loadingSubcategories: boolean;
  selectedSubcategoryId: string;
  setSelectedSubcategoryId: (id: string) => void;

  // Creation status
  creating: boolean;
  creationError: Error | null;

  // Creation methods
  createVerb: (verbData: VerbData) => Promise<boolean>;
}

/**
 * Maps verb data to a CreateVerb command
 */
function mapToVerbCommand(data: VerbData): CreateVerb {
  return {
    infinitive: data.infinitive,
    translation: data.translation,
    isRegular: data.isRegular || false,
    notes: data.usage || data.notes,
  };
}

/**
 * Use case for verb creation.
 * Manages verb-specific creation flow with proper subcategory filtering.
 */
export function useVerbCreation(): UseVerbCreationResult {
  // State
  const [selectedSubcategoryId, setSelectedSubcategoryId] = useState('');
  const [creationError, setCreationError] = useState<Error | null>(null);

  // Compose unit hooks
  const { subcategories: allSubcategories, loading: loadingSubcategories } =
    useSubcategories();

  // Use our vocabulary unit for operations
  const {
    createVerb: createVerbInVocabulary,
    creating: creatingVocabulary,
    creationError: vocabCreationError,
  } = useVocabulary({
    isVerb: true,
  });

  // Filter for verb subcategories only
  const verbSubcategories = useMemo(() => {
    return allSubcategories.filter((subcategory) => {
      // Check if this is likely a verb subcategory
      const name = subcategory.name?.toLowerCase() || '';
      return name.includes('verb') || name.includes('action');
    });
  }, [allSubcategories]);

  // Create verb
  const createVerb = useCallback(
    async (verbData: VerbData) => {
      if (!verbData.subcategoryId) {
        setCreationError(new Error('No subcategory selected'));
        return false;
      }

      try {
        setCreationError(null);

        // Map to domain command
        const command = mapToVerbCommand(verbData);

        // Use our new vocabulary unit to create the verb
        await createVerbInVocabulary(command);
        return true;
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err));
        setCreationError(error);
        return false;
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
    createVerb,
  };
}
