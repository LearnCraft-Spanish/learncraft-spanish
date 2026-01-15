import type { ColumnDefinition, TableRow } from '@domain/PasteTable';
import type { ValidationState } from '@domain/PasteTable/validationTypes';
import type { EditableTableUseCaseProps } from '@interface/components/EditableTable/types';
import type {
  ExampleTechnical,
  UpdateExampleCommand,
} from '@learncraft-spanish/shared';
import { useSelectedExamplesContext } from '@application/coordinators/hooks/useSelectedExamplesContext';
import { useExampleMutations } from '@application/queries/ExampleQueries/useExampleMutations';
import { useExamplesToEditQuery } from '@application/queries/ExampleQueries/useExamplesToEditQuery';
import { useEditTableState } from '@application/units/pasteTable';
import { useTableValidation } from '@application/units/pasteTable/hooks';
import { normalizeError } from '@application/utils/queryUtils';
import {
  mapTableRowToDomain,
  normalizeRowCells,
} from '@domain/PasteTable/functions';
import { generateAudioUrls } from '@domain/PasteTable/functions/audioUrlAdapter';
import { validateEntity } from '@domain/PasteTable/functions/entityValidation';
import {
  mapDomainToTableRows,
  mapTableRowsToDomain,
} from '@domain/PasteTable/functions/mappers';
import { updateExampleCommandSchema } from '@learncraft-spanish/shared';
import { useCallback, useMemo, useState } from 'react';
import { z } from 'zod';

// ============================================================================
// Example Edit Row - use-case specific type and mappers
// ============================================================================

/**
 * Table row type for editing examples
 * Uses hasAudio boolean instead of two separate URL fields for editing
 * Includes audio URLs for playback (derived/display-only)
 */
export interface ExampleEditRow extends Record<string, unknown> {
  id: number;
  spanish: string;
  english: string;
  hasAudio: boolean;
  spanishAudio?: string; // For audio playback (derived, display-only)
  englishAudio?: string; // For audio playback (derived, display-only)
  relatedVocabulary: number[];
  vocabularyComplete: boolean;
}

/**
 * Compute spanglish status from spanish text
 * Spanglish is true if the text contains one or more asterisks (*)
 */
function computeSpanglish(spanish: string): boolean {
  return spanish.includes('*');
}

/**
 * Compute derived fields for a row based on current cell values
 * Pure function that computes audio URLs and spanglish from row data
 */
function computeDerivedFields(row: { cells: Record<string, string> }): {
  spanishAudio: string;
  englishAudio: string;
  spanglish: string;
} {
  const domainId = Number(row.cells.id);
  const hasAudio = row.cells.hasAudio === 'true';
  const spanish = row.cells.spanish || '';

  // Compute audio URLs from hasAudio boolean
  const audioUrls = generateAudioUrls(hasAudio, domainId);

  // Compute spanglish from spanish text (contains asterisks)
  const spanglish = computeSpanglish(spanish);

  return {
    spanishAudio: audioUrls.spanishAudioLa,
    englishAudio: audioUrls.englishAudio,
    spanglish: String(spanglish),
  };
}

/**
 * Map ExampleTechnical to ExampleEditRow
 *
 * Derives:
 * - hasAudio: true if both audio URLs exist
 * - spanishAudio/englishAudio: Generated from hasAudio using generateAudioUrls
 * - spanglish: Computed from spanish text (contains asterisks)
 */
function mapExampleToEditRow(example: ExampleTechnical): ExampleEditRow {
  const hasAudio = !!(example.spanishAudio && example.englishAudio);
  const audioUrls = generateAudioUrls(hasAudio, example.id);
  const relatedVocabulary = example.vocabulary.map(
    (vocabulary) => vocabulary.id,
  );

  return {
    id: example.id,
    spanish: example.spanish,
    english: example.english,
    hasAudio,
    // Audio URLs are derived from hasAudio boolean
    spanishAudio: audioUrls.spanishAudioLa,
    englishAudio: audioUrls.englishAudio,
    // The ids of the vocabulary items that are related to this example
    relatedVocabulary,
    vocabularyComplete: example.vocabularyComplete,
  };
}

/**
 * Map ExampleEditRow back to UpdateExampleCommand
 *
 * Note: `row.id` here is the domain entity ID (number), not the table row ID (string).
 * The table system's `mapTableRowsToDomain` extracts the domain ID from `row.cells.id`
 * and converts it to the appropriate type, so `dirtyData` contains domain entities.
 */
function mapEditRowToUpdateCommand(
  row: Partial<ExampleEditRow>,
): UpdateExampleCommand {
  if (!row.id) {
    throw new Error('Row ID is required to update example');
  }

  const exampleId = Number(row.id);
  const audioUrls = generateAudioUrls(row.hasAudio ?? false, exampleId);

  return {
    exampleId,
    spanish: row.spanish,
    english: row.english,
    spanishAudio: audioUrls.spanishAudioLa,
    englishAudio: audioUrls.englishAudio,
    relatedVocabulary: row.relatedVocabulary,
    vocabularyComplete: row.vocabularyComplete,
  };
}

/**
 * Return type for the useExampleEditor hook
 */
export interface UseExampleEditorResult {
  /** Pre-composed table props - satisfies EditableTableUseCaseProps contract */
  tableProps: EditableTableUseCaseProps;
  /** Error from save operation, if any */
  saveError: Error | null;
  /** Handlers to track audio load success/failure */
  audioErrorHandlers: {
    onAudioError: (rowId: string, columnId: string) => void;
    onAudioSuccess: (rowId: string, columnId: string) => void;
  };
}

/**
 * Schema for validating example edit rows
 * Derived from updateExampleCommandSchema, adapted for table UI:
 * - Renames exampleId -> id
 * - Replaces audio URL fields with hasAudio boolean
 * - Makes vocabularyComplete required (has default in UI)
 *
 */
const exampleEditRowSchema = updateExampleCommandSchema
  .omit({
    exampleId: true,
    spanishAudio: true,
    englishAudio: true,
    relatedVocabulary: true,
    vocabularyComplete: true,
  })
  .extend({
    id: z.coerce.number(),
    spanish: z.string().min(1, 'Spanish text is required'),
    english: z.string().min(1, 'English translation is required'),
    hasAudio: z.coerce.boolean(),
    relatedVocabulary: z.array(z.coerce.number()),
    vocabularyComplete: z.coerce.boolean(),
  });

/**
 * Column definitions for the example edit table
 *
 * These definitions control:
 * - Data types and validation (via rowSchema)
 * - Editability (editable: false = read-only)
 * - Display behavior (derived: true = computed/display-only)
 *
 * Note: Custom cell rendering (e.g., AudioPlaybackCell for audio columns) is
 * handled in the interface layer (ExampleEditor component) via the renderCell
 * function. The column definitions here mark audio columns as 'derived' to
 * indicate they're display-only, but the actual component selection happens
 * in the interface layer based on column.id.
 */
const exampleEditColumns: ColumnDefinition[] = [
  { id: 'id', type: 'read-only', editable: false },
  { id: 'spanish', type: 'textarea', required: true },
  { id: 'english', type: 'textarea', required: true },
  { id: 'hasAudio', type: 'boolean' },
  { id: 'spanishAudio', type: 'text', editable: false, derived: true },
  { id: 'englishAudio', type: 'text', editable: false, derived: true },
  { id: 'relatedVocabulary', type: 'custom', editable: false, derived: true },
  { id: 'vocabularyComplete', type: 'boolean' },
];

/**
 * Use case hook for editing examples using a paste table
 *
 * Features:
 * - Edit existing examples in a table format
 * - Single hasAudio boolean instead of two URL fields
 * - Dirty state tracking
 * - Validation
 * - Save dirty changes to server
 */
export function useExampleEditor(): UseExampleEditorResult {
  // State for save operation
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<Error | null>(null);
  // Track audio errors by row/column so we can block save
  const [audioErrors, setAudioErrors] = useState<Map<string, Set<string>>>(
    () => new Map(),
  );

  const { selectedExampleIds } = useSelectedExamplesContext();

  const { examples: examplesToEdit, isLoading: isLoadingExamplesToEdit } =
    useExamplesToEditQuery(selectedExampleIds);

  const { updateExamples } = useExampleMutations();

  // 1. Source data is always true and fresh (from server)
  // Map source examples to edit rows with initial derived field computation
  const sourceData = useMemo(
    () => examplesToEdit?.map(mapExampleToEditRow) ?? [],
    [examplesToEdit],
  );

  // 2. Map domain → table before calling state hook
  const sourceRows = useMemo(
    () => mapDomainToTableRows(sourceData, exampleEditColumns, 'id'),
    [sourceData],
  );

  // 3. Compute derived fields function - computes from current cell values
  // This ensures derived fields stay in sync with current row values (source + user edits)
  const computeDerivedFieldsForRow = useCallback(
    (row: { cells: Record<string, string> }): Record<string, string> => {
      const computedFields = computeDerivedFields(row);
      return computedFields;
    },
    [],
  );

  // 4. Use edit table state hook (focused on state only - no mapping, no validation)
  const editTableState = useEditTableState({
    sourceRows,
    columns: exampleEditColumns,
    computeDerivedFields: computeDerivedFieldsForRow,
  });

  // 5. Compose validation explicitly: normalize → map → validate (domain-side)
  const validateRow = useMemo(() => {
    return (row: TableRow) => {
      // 1. Normalize strings
      const normalized = normalizeRowCells(row.cells, exampleEditColumns);

      // 2. Map to domain entity (typed)
      const domainEntity = mapTableRowToDomain<ExampleEditRow>(
        { ...row, cells: normalized },
        exampleEditColumns,
      );

      // 3. Validate domain entity (typed validation)
      const result = validateEntity(domainEntity, exampleEditRowSchema);
      return result.errors;
    };
  }, []); // exampleEditColumns and exampleEditRowSchema are constants

  // 6. Base validation (focused unit)
  const baseValidation = useTableValidation({
    rows: editTableState.data.rows,
    validateRow,
  });

  const registerAudioError = useCallback((rowId: string, columnId: string) => {
    setAudioErrors((prev) => {
      const next = new Map(prev);
      const existing = next.get(rowId) ?? new Set<string>();
      existing.add(columnId);
      next.set(rowId, existing);
      return next;
    });
  }, []);

  const clearAudioError = useCallback((rowId: string, columnId: string) => {
    setAudioErrors((prev) => {
      const next = new Map(prev);
      const existing = next.get(rowId);
      if (existing) {
        existing.delete(columnId);
        if (existing.size === 0) {
          next.delete(rowId);
        } else {
          next.set(rowId, existing);
        }
      }
      return next;
    });
  }, []);

  // 7. Merge validation: base validation + custom validation (audio, relatedVocabulary)
  const mergedValidationState: ValidationState = useMemo(() => {
    const mergedErrors: Record<string, Record<string, string>> = {
      ...baseValidation.validationState.errors,
    };

    const rowsWithAudio = new Set(
      editTableState.data.rows
        .filter((row) => String(row.cells.hasAudio).toLowerCase() === 'true')
        .map((row) => row.id),
    );

    let hasAudioErrors = false;

    audioErrors.forEach((columnIds, rowId) => {
      if (!rowsWithAudio.has(rowId)) {
        return;
      }
      if (!mergedErrors[rowId]) mergedErrors[rowId] = {};
      columnIds.forEach((columnId) => {
        mergedErrors[rowId][columnId] = 'Audio failed to load';
        hasAudioErrors = true;
      });
    });

    // Custom validation for relatedVocabulary: must be valid JSON array of numbers
    let hasRelatedVocabularyErrors = false;
    editTableState.data.rows.forEach((row) => {
      const value = row.cells.relatedVocabulary || '';
      if (!value.trim()) {
        // Empty is valid (no vocabulary selected)
        return;
      }

      try {
        const parsed = JSON.parse(value);
        if (!Array.isArray(parsed)) {
          if (!mergedErrors[row.id]) mergedErrors[row.id] = {};
          mergedErrors[row.id].relatedVocabulary =
            'Related vocabulary must be an array';
          hasRelatedVocabularyErrors = true;
          return;
        }

        // Validate all items are numbers
        const invalidItems = parsed.filter(
          (item) => typeof item !== 'number' || Number.isNaN(item),
        );
        if (invalidItems.length > 0) {
          if (!mergedErrors[row.id]) mergedErrors[row.id] = {};
          mergedErrors[row.id].relatedVocabulary =
            'All vocabulary IDs must be valid numbers';
          hasRelatedVocabularyErrors = true;
        }
      } catch {
        // Invalid JSON
        if (!mergedErrors[row.id]) mergedErrors[row.id] = {};
        mergedErrors[row.id].relatedVocabulary =
          'Invalid format: must be a valid array';
        hasRelatedVocabularyErrors = true;
      }
    });

    return {
      isValid:
        baseValidation.validationState.isValid &&
        !hasAudioErrors &&
        !hasRelatedVocabularyErrors,
      errors: mergedErrors,
    };
  }, [audioErrors, editTableState.data.rows, baseValidation.validationState]);

  // 8. Handle applying changes - get dirty rows, map to domain, then save
  const handleApplyChanges = useCallback(async () => {
    // Check validation before proceeding
    if (Object.keys(mergedValidationState.errors).length > 0) {
      throw new Error('validation failed');
    }

    setIsSaving(true);
    setSaveError(null);

    try {
      // Get dirty rows from state
      const dirtyRows = editTableState.getDirtyRows();

      // Map table → domain
      const dirtyData = mapTableRowsToDomain<ExampleEditRow>(
        dirtyRows,
        exampleEditColumns,
      );

      // Map to update commands
      // Derived fields (audio URLs) are computed here from hasAudio
      const updateCommands = dirtyData.map((row) =>
        mapEditRowToUpdateCommand(row),
      );

      // Call the mutation to save changes
      await updateExamples(updateCommands);
    } catch (err) {
      const error = normalizeError(err);
      setSaveError(error);
      throw error;
    } finally {
      setIsSaving(false);
    }
  }, [
    mergedValidationState.errors,
    editTableState,
    updateExamples,
    // exampleEditColumns is a constant, not a dependency
  ]);

  // 9. Compose table props before returning (following codebase pattern)
  const tableProps = useMemo<EditableTableUseCaseProps>(
    () => ({
      rows: editTableState.data.rows,
      columns: editTableState.data.columns,
      dirtyRowIds: editTableState.dirtyRowIds,
      validationErrors: mergedValidationState.errors,
      onCellChange: editTableState.updateCell,
      onPaste: editTableState.handlePaste,
      setActiveCellInfo: editTableState.setActiveCellInfo,
      clearActiveCellInfo: editTableState.clearActiveCellInfo,
      hasUnsavedChanges: editTableState.hasUnsavedChanges,
      onSave: handleApplyChanges,
      onDiscard: editTableState.discardChanges,
      isSaving,
      isLoading: isLoadingExamplesToEdit,
      isValid: mergedValidationState.isValid,
    }),
    [
      editTableState.data.rows,
      editTableState.data.columns,
      editTableState.dirtyRowIds,
      editTableState.updateCell,
      editTableState.handlePaste,
      editTableState.setActiveCellInfo,
      editTableState.clearActiveCellInfo,
      editTableState.hasUnsavedChanges,
      editTableState.discardChanges,
      handleApplyChanges,
      mergedValidationState.errors,
      mergedValidationState.isValid,
      isSaving,
      isLoadingExamplesToEdit,
    ],
  );

  return {
    tableProps,
    saveError,
    audioErrorHandlers: {
      onAudioError: registerAudioError,
      onAudioSuccess: clearAudioError,
    },
  };
}
