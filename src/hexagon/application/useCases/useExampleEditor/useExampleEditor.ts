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
import { createAudioUrlAdapter } from '@domain/PasteTable/functions/audioUrlAdapter';
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
  spanglish: boolean;
  vocabularyComplete: boolean;
}

/**
 * Map ExampleTechnical to ExampleEditRow
 */
function mapExampleToEditRow(example: ExampleTechnical): ExampleEditRow {
  const hasAudio = !!(example.spanishAudio && example.englishAudio);
  return {
    id: example.id,
    spanish: example.spanish,
    english: example.english,
    hasAudio,
    spanishAudio: example.spanishAudio,
    englishAudio: example.englishAudio,
    spanglish: example.spanglish,
    vocabularyComplete: example.vocabularyComplete,
  };
}

/**
 * Map ExampleEditRow back to UpdateExampleCommand
 */
function mapEditRowToUpdateCommand(
  row: Partial<ExampleEditRow>,
  audioUrlAdapter: ReturnType<typeof createAudioUrlAdapter>,
): UpdateExampleCommand {
  const exampleId = Number(row.id);
  const audioUrls = audioUrlAdapter.generateAudioUrls(
    row.hasAudio ?? false,
    exampleId,
  );
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
 * Column definitions for the example edit table (domain only)
 */
const exampleEditColumns: ColumnDefinition[] = [
  { id: 'id', type: 'text', editable: false },
  { id: 'spanish', type: 'text', required: true },
  { id: 'english', type: 'text', required: true },
  { id: 'hasAudio', type: 'boolean' },
  { id: 'spanishAudio', type: 'text', editable: false, derived: true },
  { id: 'englishAudio', type: 'text', editable: false, derived: true },
  { id: 'spanglish', type: 'text', editable: false, derived: true },
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

  const {
    examples: examplesToEdit,
    isLoading: isLoadingExamplesToEdit,
    error: _errorExamplesToEdit,
  } = useExamplesToEditQuery(selectedExampleIds);

  const { updateExamples } = useExampleMutations();

  // Create audio URL adapter for generating URLs from hasAudio
  const audioUrlAdapter = useMemo(() => createAudioUrlAdapter(), []);

  // Map source examples to edit rows
  const sourceData = useMemo(
    () => examplesToEdit?.map(mapExampleToEditRow) ?? [],
    [examplesToEdit],
  );

  // Handle applying changes - maps back to UpdateExamplesCommand
  const handleApplyChanges = useCallback(
    async (dirtyData: Partial<ExampleEditRow>[]) => {
      setIsSaving(true);
      setSaveError(null);

      try {
        // Map dirty rows to update commands
        const updateCommands = dirtyData.map((row) =>
          mapEditRowToUpdateCommand(row, audioUrlAdapter),
        );

        // Call the adapter to save
        await updateExamples(updateCommands);
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err));
        setSaveError(error);
        throw error; // Re-throw so useEditTable knows it failed
      } finally {
        setIsSaving(false);
      }
    },
    [audioUrlAdapter, updateExamples],
  );

  // Use the edit table hook
  const editTable = useEditTable<ExampleEditRow>({
    columns: exampleEditColumns,
    sourceData,
    rowSchema: exampleEditRowSchema,
    idColumnId: 'id',
    onApplyChanges: handleApplyChanges,
  });

  return {
    editTable,
    isLoading: isLoadingExamplesToEdit,
    isSaving,
    saveError,
  };
}
