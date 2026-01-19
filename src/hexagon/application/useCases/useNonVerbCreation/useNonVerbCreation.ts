import type { VocabularyPaginationState } from '@application/useCases/types';
import type { CreateTableUseCaseProps } from '@interface/components/CreateTable/types';
import type { TableRow } from '@domain/PasteTable';
import type { CreateNonVerbVocabulary, Subcategory } from '@learncraft-spanish/shared';
import { VOCABULARY_COLUMNS } from '@application/implementations/vocabularyTable/constants';
import { useVocabularyTable } from '@application/implementations/vocabularyTable/useVocabularyTable';
import { useSubcategories } from '@application/queries/useSubcategories';
import { GHOST_ROW_ID } from '@application/units/pasteTable/constants';
import { useTableValidation } from '@application/units/pasteTable/hooks';
import useVocabulary from '@application/units/useVocabulary';
import useVocabularyPage from '@application/units/useVocabularyPage';
import { normalizeError } from '@application/utils/queryUtils';
import {
  mapAndParseTableRowsToDomain,
  mapTableRowToDomain,
  normalizeRowCells,
} from '@domain/PasteTable/functions';
import { validateEntity } from '@domain/PasteTable/functions/entityValidation';
import { CreateNonVerbVocabularySchema } from '@learncraft-spanish/shared';
import { useCallback, useMemo, useState } from 'react';

export interface UseNonVerbCreationResult {
  // Subcategory selection
  nonVerbSubcategories: Subcategory[];
  loadingSubcategories: boolean;
  selectedSubcategoryId: string;
  setSelectedSubcategoryId: (id: string) => void;

  // Creation status
  creating: boolean;
  creationError: Error | null;

  // Table props - ready to pass to CreateTable component
  tableProps: CreateTableUseCaseProps;

  // Vocabulary list for currently selected subcategory
  currentVocabularyPagination: VocabularyPaginationState | null;
}

/**
 * Use case for non-verb vocabulary creation.
 * Implements the Façade pattern by composing multiple units into a unified API.
 */
export default function useNonVerbCreation(): UseNonVerbCreationResult {
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

  // 1. Use create table state hook (focused on state only - no mapping, no validation)
  const tableState = useVocabularyTable();

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

  // 2. Compose validation explicitly: normalize → map → validate (domain-side)
  const validateRow = useMemo(() => {
    return (row: TableRow) => {
      // 1. Normalize strings
      const normalized = normalizeRowCells(row.cells, VOCABULARY_COLUMNS);

      // 2. Map to domain entity (typed)
      const domainEntity = mapTableRowToDomain<CreateNonVerbVocabulary>(
        { ...row, cells: normalized },
        VOCABULARY_COLUMNS,
      );

      // 3. Validate domain entity (typed validation)
      const result = validateEntity(
        domainEntity,
        CreateNonVerbVocabularySchema,
      );
      return result.errors;
    };
  }, []); // VOCABULARY_COLUMNS and CreateNonVerbVocabularySchema are constants

  // 3. Base validation (focused unit)
  const baseValidation = useTableValidation({
    rows: tableState.data.rows,
    validateRow,
  });

  // Reset pagination when changing subcategory
  const handleSubcategoryChange = useCallback((id: string) => {
    setSelectedSubcategoryId(id);
    setPage(1); // Reset to first page when subcategory changes
  }, []);

  // 4. Handle save - get rows, map to domain, validate, then create
  const handleSave = useCallback(async () => {
    // Validate subcategory is selected
    if (!selectedSubcategoryId) {
      setCreationError(new Error('No subcategory selected'));
      return;
    }

    // Check validation before proceeding
    if (!baseValidation.validationState.isValid) {
      setCreationError(new Error('Please fix validation errors before saving'));
      return;
    }

    try {
      setCreationError(null);

      // Get rows from state (excluding ghost row)
      const dataRows = tableState
        .getRows()
        .filter((row) => row.id !== GHOST_ROW_ID);

      if (dataRows.length === 0) {
        return;
      }

      // Map table → domain (with parsing/validation to ensure completeness)
      // This validates and returns complete T[] (not Partial<T>[])
      // Will throw if validation fails, which we catch below
      const domainEntities =
        mapAndParseTableRowsToDomain<CreateNonVerbVocabulary>(
          dataRows,
          VOCABULARY_COLUMNS,
          CreateNonVerbVocabularySchema,
          GHOST_ROW_ID,
        );

      // Add subcategoryId to each entry
      const commands = domainEntities.map((entry) => ({
        ...entry,
        subcategoryId: Number(selectedSubcategoryId),
      }));

      // Create the vocabulary batch
      await createNonVerbVocabulary(commands);
    } catch (err) {
      const error = normalizeError(err);
      setCreationError(error);
      throw error;
    }
  }, [
    selectedSubcategoryId,
    baseValidation.validationState.isValid,
    tableState,
    createNonVerbVocabulary,
  ]);

  // 5. Compose tableProps to satisfy CreateTableUseCaseProps contract
  const tableProps = useMemo(() => {
    const dataRows = tableState
      .getRows()
      .filter((row) => row.id !== GHOST_ROW_ID);
    const hasData = dataRows.length > 0;

    return {
      rows: tableState.data.rows,
      columns: tableState.data.columns,
      validationErrors: baseValidation.validationState.errors,
      isValid: baseValidation.validationState.isValid,
      isSaving: creatingVocabulary,
      hasData,
      onCellChange: tableState.updateCell,
      onPaste: tableState.handlePaste,
      onSave: handleSave,
      onReset: tableState.resetTable,
      activeCell: tableState.activeCell,
      setActiveCell: tableState.setActiveCell,
      setActiveCellInfo: tableState.setActiveCellInfo,
      clearActiveCellInfo: tableState.clearActiveCellInfo,
    };
  }, [
    tableState,
    baseValidation.validationState,
    creatingVocabulary,
    handleSave,
  ]);

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

    // Table props - ready to pass to CreateTable component
    tableProps,

    // Paginated vocabulary data
    currentVocabularyPagination,
  };
}
