import type {
  CreateNonVerbVocabulary,
  Subcategory,
} from '@LearnCraft-Spanish/shared';
import type { TableHook } from '../units/pasteTable/types';
import { useCallback, useMemo, useState } from 'react';
import { useSubcategories } from '../units/useSubcategories';
import { useVocabulary } from '../units/useVocabulary';
import { useVocabularyTable } from '../units/useVocabularyTable';

// Define VocabularyTableData to match what's in useVocabularyTable
export interface VocabularyTableData {
  descriptor: string;
  frequency: number;
  spellings: string;
  notes?: string;
}

interface UseNonVerbCreationResult {
  // Subcategory selection
  nonVerbSubcategories: Subcategory[];
  loadingSubcategories: boolean;
  selectedSubcategoryId: string;
  setSelectedSubcategoryId: (id: string) => void;

  // Creation status
  creating: boolean;
  creationError: Error | null;

  // Table hook API - exposed through the façade
  tableHook: TableHook<VocabularyTableData>;

  // Unified save action that handles validation, table save, and creation
  saveVocabulary: () => Promise<boolean>;
}

/**
 * Maps a VocabularyEntry from the table to a CreateNonVerbVocabulary command
 * Extracts the word from the descriptor if needed
 */
function mapEntryToCommand(
  entry: VocabularyTableData,
  subcategoryId: string,
): CreateNonVerbVocabulary {
  // Extract word from descriptor format "word: description (context)"
  const word = entry.descriptor.split(':')[0]?.trim() || '';

  return {
    word,
    descriptor: entry.descriptor,
    subcategoryId: Number(subcategoryId),
    frequency: entry.frequency,
    notes: entry.notes || undefined,
  };
}

/**
 * Use case for non-verb vocabulary creation.
 * Implements the Façade pattern by composing multiple units into a unified API.
 */
export function useNonVerbCreation(): UseNonVerbCreationResult {
  // State
  const [selectedSubcategoryId, setSelectedSubcategoryId] = useState('');
  const [creationError, setCreationError] = useState<Error | null>(null);

  // Compose unit hooks
  const { subcategories: allSubcategories, loading: loadingSubcategories } =
    useSubcategories();

  // Use our vocabulary unit for operations
  const {
    createBatch,
    creating: creatingVocabulary,
    creationError: vocabCreationError,
  } = useVocabulary({
    isVerb: false,
  });

  // Create the table hook internally
  const tableHook = useVocabularyTable();

  // Filter for non-verb subcategories only
  const nonVerbSubcategories = useMemo(() => {
    return allSubcategories.filter((subcategory) => {
      // Check if this is likely NOT a verb subcategory
      const name = subcategory.name?.toLowerCase() || '';
      return !name.includes('verb') && !name.includes('action');
    });
  }, [allSubcategories]);

  // Create vocabulary batch - internal implementation
  const createVocabularyBatch = useCallback(
    async (data: VocabularyTableData[]) => {
      if (!selectedSubcategoryId) {
        setCreationError(new Error('No subcategory selected'));
        return false;
      }

      try {
        setCreationError(null);

        // Map table entries to proper domain commands
        const commands = data.map((entry) =>
          mapEntryToCommand(entry, selectedSubcategoryId),
        );

        // Use our new vocabulary unit to create the batch
        await createBatch(commands);
        return true;
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err));
        setCreationError(error);
        return false;
      }
    },
    [selectedSubcategoryId, createBatch],
  );

  /**
   * Unified save method exposed to the interface.
   * Handles all the steps: validation, table save, and creation.
   */
  const saveVocabulary = useCallback(async (): Promise<boolean> => {
    // Validate subcategory is selected
    if (!selectedSubcategoryId) {
      setCreationError(new Error('No subcategory selected'));
      return false;
    }

    try {
      // Validate and save the table data
      const tableData = await tableHook.saveData();

      // If table validation failed or no data
      if (!tableData || tableData.length === 0) {
        return false;
      }

      // Create the vocabulary batch
      return await createVocabularyBatch(tableData);
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setCreationError(error);
      return false;
    }
  }, [selectedSubcategoryId, createVocabularyBatch, tableHook]);

  // Combine errors from both sources
  const combinedError = creationError || vocabCreationError;

  return {
    // Subcategory selection
    nonVerbSubcategories,
    loadingSubcategories,
    selectedSubcategoryId,
    setSelectedSubcategoryId,

    // Creation status
    creating: creatingVocabulary,
    creationError: combinedError,

    // Expose table hook through the façade
    tableHook,

    // Unified save action
    saveVocabulary,
  };
}
