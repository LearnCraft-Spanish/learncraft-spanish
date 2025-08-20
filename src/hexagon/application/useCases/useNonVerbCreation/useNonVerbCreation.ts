import type { CreateNonVerbVocabulary } from '@learncraft-spanish/shared';
import type { UseNonVerbCreationResult } from './useNonVerbCreation.types';
import { useVocabularyTable } from '@application/implementations/vocabularyTable/useVocabularyTable';
import { useSubcategories } from '@application/queries/useSubcategories';
import { useVocabularyQuery } from '@application/queries/useVocabularyQuery';
import useQueryPagination from '@application/units/Pagination/useQueryPagination';
import {
  CreateNonVerbVocabularySchema,
  PartOfSpeech,
  validateWithSchema,
} from '@learncraft-spanish/shared';
import { useCallback, useMemo, useState } from 'react';

/**
 * Use case for non-verb vocabulary creation.
 * Implements the Façade pattern by composing multiple units into a unified API.
 */
export default function useNonVerbCreation(): UseNonVerbCreationResult {
  // State
  const [selectedSubcategoryId, setSelectedSubcategoryId] = useState(0);
  const [creationError, setCreationError] = useState<Error | null>(null);

  const PAGE_SIZE = 25;

  // Subcategories Data
  const { subcategories: allSubcategories, loading: loadingSubcategories } =
    useSubcategories();

  const tableHook = useVocabularyTable();

  const vocabularyQuery = useVocabularyQuery(selectedSubcategoryId, PAGE_SIZE);

  // Vocabulary Data
  const {
    items: vocabularyItems,
    isLoading: isVocabularyLoading,
    error: vocabularyError,
    page: queryPage,
    pageSize: queryPageSize,
    totalCount: queryTotalCount,
    changePage,
    // TODO: How does this get passed to query pagination?
    // setCanPrefetch,
    creating: creatingVocabulary,
    creationError: vocabCreationError,
    createVocabulary,
    // TODO: Implement delete vocabulary
    // deleteVocabulary,
    // deleting,
    // deletionError,
  } = vocabularyQuery;

  // Pagination Data
  const queryPagination = useQueryPagination({
    queryPage,
    pageSize: PAGE_SIZE,
    queryPageSize,
    totalCount: queryTotalCount ?? 0,
    changeQueryPage: changePage,
  });

  // Filter for non-verb subcategories only
  const nonVerbSubcategories = useMemo(() => {
    return allSubcategories.filter((subcategory) => {
      // Exclude only the verb part of speech
      return subcategory.partOfSpeech !== PartOfSpeech.Verb;
    });
  }, [allSubcategories]);

  // Convert selectedSubcategoryId to number for the query
  // If no valid ID is selected, use 0 which won't match any data
  const numericSubcategoryId = useMemo(() => {
    if (!selectedSubcategoryId) return 0;
    const id = Number(selectedSubcategoryId);
    return Number.isNaN(id) ? 0 : id;
  }, [selectedSubcategoryId]);

  // Reset pagination when changing subcategory
  const handleSubcategoryChange = useCallback(
    (id: string) => {
      const numericId = Number(id);
      setSelectedSubcategoryId(numericId);
      changePage(1); // Reset to first page when subcategory changes
    },
    [changePage],
  );

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

        const createdIds = await createVocabulary(commands);

        return createdIds;
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err));
        setCreationError(error);
        return [];
      }
    },
    [selectedSubcategoryId, createVocabulary],
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
    selectedSubcategoryId: numericSubcategoryId.toString(),
    setSelectedSubcategoryId: handleSubcategoryChange,

    // Creation status
    creating: creatingVocabulary,
    creationError: combinedError,

    // Expose table hook through the façade
    tableHook,

    // Unified save action
    saveVocabulary,

    // Paginated vocabulary data
    currentVocabularyPagination: queryPagination,

    // Vocabulary query
    vocabularyItems,
    isVocabularyLoading,
    vocabularyError,
    totalCount: queryTotalCount,
  };
}
