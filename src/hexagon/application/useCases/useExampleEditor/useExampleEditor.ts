import type { EditTableHook } from '@application/units/pasteTable/useEditTable';
import type { ColumnDefinition } from '@domain/PasteTable';
import type {
  ExampleTechnical,
  UpdateExampleCommand,
} from '@learncraft-spanish/shared';
import { useSelectedExamplesContext } from '@application/coordinators/hooks/useSelectedExamplesContext';
import { useExampleMutations } from '@application/queries/ExampleQueries/useExampleMutations';
import { useExamplesToEditQuery } from '@application/queries/ExampleQueries/useExamplesToEditQuery';
import { useEditTable } from '@application/units/pasteTable/useEditTable';
import { normalizeError } from '@application/utils/queryUtils';
import { generateAudioUrls } from '@domain/PasteTable/functions/audioUrlAdapter';
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

  return {
    id: example.id,
    spanish: example.spanish,
    english: example.english,
    hasAudio,
    // Audio URLs are derived from hasAudio boolean
    spanishAudio: audioUrls.spanishAudioLa,
    englishAudio: audioUrls.englishAudio,
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
    vocabularyComplete: row.vocabularyComplete,
  };
}

/**
 * Return type for the useExampleEditor hook
 */
export interface UseExampleEditorResult {
  /** The edit table hook with all table operations */
  editTable: EditTableHook<ExampleEditRow>;
  /** Whether data is currently loading */
  isLoading: boolean;
  /** Whether save operation is in progress */
  isSaving: boolean;
  /** Error from save operation, if any */
  saveError: Error | null;
}

/**
 * Schema for validating example edit rows
 * Derived from updateExampleCommandSchema, adapted for table UI:
 * - Renames exampleId -> id
 * - Replaces audio URL fields with hasAudio boolean
 * - Adds spanglish (display-only, computed server-side)
 * - Makes vocabularyComplete required (has default in UI)
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
    spanglish: z.coerce.boolean(),
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

  // 2. Handle applying changes - maps back to UpdateExampleCommand
  // Computed data from merged rows is used for saves
  const handleApplyChanges = useCallback(
    async (dirtyData: Partial<ExampleEditRow>[]) => {
      setIsSaving(true);
      setSaveError(null);

      try {
        // Map dirty rows to update commands
        // Derived fields (audio URLs) are computed here from hasAudio
        const updateCommands = dirtyData.map((row) =>
          mapEditRowToUpdateCommand(row),
        );
        // Call the mutation to save changes
        await updateExamples(updateCommands);
      } catch (err) {
        const error = normalizeError(err);
        setSaveError(error);
        throw error; // Re-throw so useEditTable knows it failed
      } finally {
        setIsSaving(false);
      }
    },
    [updateExamples],
  );

  // 3. Compute derived fields function - computes from current cell values
  // This ensures derived fields stay in sync with current row values (source + user edits)
  const computeDerivedFieldsForRow = useCallback(
    (row: { cells: Record<string, string> }): Record<string, string> => {
      return computeDerivedFields(row);
    },
    [],
  );

  // 4. Use edit table hook - merges source + diffs and computes derived fields
  const editTable = useEditTable<ExampleEditRow>({
    columns: exampleEditColumns,
    sourceData,
    rowSchema: exampleEditRowSchema,
    idColumnId: 'id',
    onApplyChanges: handleApplyChanges,
    computeDerivedFields: computeDerivedFieldsForRow,
  });

  return {
    editTable,
    isLoading: isLoadingExamplesToEdit,
    isSaving,
    saveError,
  };
}
