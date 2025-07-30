import type { CreateNonVerbVocabulary } from '@learncraft-spanish/shared';
import type {
  UseNonVerbCreationResult,
  VocabularyPaginationState,
} from './types';
import {
  CreateNonVerbVocabularySchema,
  validateWithSchema,
} from '@learncraft-spanish/shared';
import { useCallback, useMemo, useState } from 'react';
import { useVocabularyTable } from '../implementations/vocabularyTable/useVocabularyTable';
import { useSubcategories } from '../units/useSubcategories';
import { useVocabulary } from '../units/useVocabulary';
import { useVocabularyPage } from '../units/useVocabularyPage';

/**
 * Use case for non-verb vocabulary creation.
 * Implements the Façade pattern by composing multiple units into a unified API.
 */
export function useNonVerbCreation(): UseNonVerbCreationResult {
  // State
  const [selectedSubcategoryId, setSelectedSubcategoryId] = useState('');
  const [creationError, setCreationError] = useState<Error | null>(null);
  const [page, setPage] = useState(1);
  const pageSize = 10;

  // Compose unit hooks
  const { subcategories: allSubcategories, loading: loadingSubcategories } =
    useSubcategories();

  // Use our vocabulary unit for operations
  const {
    creating: creatingVocabulary,
    creationError: vocabCreationError,
    createNonVerbVocabulary,
  } = useVocabulary();

  // Create the table hook internally
  const tableHook = useVocabularyTable();

  // Filter for non-verb subcategories only
  const nonVerbSubcategories = useMemo(() => {
    return allSubcategories.filter((subcategory) => {
      // Exclude only the verb part of speech
      return subcategory.partOfSpeech !== 'Verb';
    });
  }, [allSubcategories]);

  // Convert selectedSubcategoryId to number for the query
  // If no valid ID is selected, use 0 which won't match any data
  const numericSubcategoryId = useMemo(() => {
    if (!selectedSubcategoryId) return 0;
    const id = Number(selectedSubcategoryId);
    return Number.isNaN(id) ? 0 : id;
  }, [selectedSubcategoryId]);

  // Get paginated vocabulary data for the selected subcategory
  const {
    items: vocabularyItems,
    isLoading: isVocabularyLoading,
    isCountLoading,
    error: vocabularyError,
    totalCount,
    totalPages,
    hasMorePages,
    page: currentPage,
    isFetching: isPageFetching,
  } = useVocabularyPage(
    numericSubcategoryId,
    page,
    pageSize,
    // numericSubcategoryId > 0, // Only enable queries when we have a valid subcategory ID
  );

  // Create pagination state object only if a subcategory is selected
  const currentVocabularyPagination: VocabularyPaginationState | null =
    useMemo(() => {
      if (!selectedSubcategoryId) return null;

      return {
        vocabularyItems,
        isLoading: isVocabularyLoading,
        isCountLoading,
        isFetching: isPageFetching,
        error: vocabularyError,
        totalCount,
        totalPages,
        hasMorePages,
        currentPage,
        pageSize,
        goToNextPage: () => {
          // Only move to next page if we have more pages or are reasonably sure there are more
          if ((totalPages !== null && page < totalPages) || hasMorePages) {
            setPage((prev) => prev + 1);
          }
        },
        goToPreviousPage: () => {
          if (page > 1) {
            setPage((prev) => prev - 1);
          }
        },
      };
    }, [
      selectedSubcategoryId,
      vocabularyItems,
      isVocabularyLoading,
      isCountLoading,
      isPageFetching,
      vocabularyError,
      totalCount,
      totalPages,
      hasMorePages,
      currentPage,
      page,
    ]);

  // Reset pagination when changing subcategory
  const handleSubcategoryChange = useCallback((id: string) => {
    setSelectedSubcategoryId(id);
    setPage(1); // Reset to first page when subcategory changes
  }, []);

  // Create vocabulary batch - internal implementation
  const createVocabularyBatch = useCallback(
    async (data: CreateNonVerbVocabulary[]) => {
      if (!selectedSubcategoryId) {
        setCreationError(new Error('No subcategory selected'));
        return [];
      }

      try {
        setCreationError(null);

        // Validate all entries before processing
        const validationErrors: string[] = [];
        data.forEach((entry, index) => {
          const command = {
            ...entry,
            subcategoryId: Number(selectedSubcategoryId),
          };
          const result = validateWithSchema(
            CreateNonVerbVocabularySchema,
            command,
          );
          if (!result.isValid) {
            validationErrors.push(
              `Row ${index + 1}: ${result.errors.join(', ')}`,
            );
          }
        });

        if (validationErrors.length > 0) {
          throw new Error(`Validation errors:\n${validationErrors.join('\n')}`);
        }

        // Use our new vocabulary unit to create the batch
        const commands = data.map((entry) => ({
          ...entry,
          subcategoryId: Number(selectedSubcategoryId),
        }));

        const createdIds = await createNonVerbVocabulary(commands);

        return createdIds;
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err));
        setCreationError(error);
        return [];
      }
    },
    [selectedSubcategoryId, createNonVerbVocabulary],
  );

  /**
   * Unified save method exposed to the interface.
   * Handles all the steps: validation, table save, and creation.
   */
  const saveVocabulary = useCallback(async (): Promise<number[]> => {
    // Validate subcategory is selected
    if (!selectedSubcategoryId) {
      setCreationError(new Error('No subcategory selected'));
      return [];
    }

    try {
      // Validate and save the table data
      const tableData = await tableHook.saveData();

      // If table validation failed or no data
      if (!tableData || tableData.length === 0) {
        return [];
      }

      // Create the vocabulary batch
      return await createVocabularyBatch(tableData);
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setCreationError(error);
      return [];
    }
  }, [selectedSubcategoryId, createVocabularyBatch, tableHook]);

  // Combine errors from both sources
  const combinedError = creationError || vocabCreationError;

  return {
    // Subcategory selection
    nonVerbSubcategories,
    loadingSubcategories,
    selectedSubcategoryId,
    setSelectedSubcategoryId: handleSubcategoryChange,

    // Creation status
    creating: creatingVocabulary,
    creationError: combinedError,

    // Expose table hook through the façade
    tableHook,

    // Unified save action
    saveVocabulary,

    // Paginated vocabulary data
    currentVocabularyPagination,
  };
}
