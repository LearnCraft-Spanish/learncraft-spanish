import type {
  ExampleEditRow,
  UseExampleEditorProps,
  UseExampleEditorResult,
} from '@application/useCases/useExampleEditor/useExampleEditor.types';
import type { TableColumn } from '@domain/PasteTable/General';
import type {
  ExampleTechnical,
  UpdateExampleCommand,
} from '@learncraft-spanish/shared';
import { useExampleAdapter } from '@application/adapters/exampleAdapter';
import { useEditTable } from '@application/units/pasteTable/useEditTable';
import { createAudioUrlAdapter } from '@domain/PasteTable/functions/audioUrlAdapter';
import { useCallback, useMemo, useState } from 'react';
import { z } from 'zod';

/**
 * Schema for validating example edit rows
 */
const exampleEditRowSchema = z.object({
  id: z.coerce.number(),
  spanish: z.string().min(1, 'Spanish text is required'),
  english: z.string().min(1, 'English translation is required'),
  hasAudio: z.coerce.boolean(),
  spanglish: z.coerce.boolean(),
  vocabularyComplete: z.coerce.boolean(),
});

/**
 * Column definitions for the example edit table
 */
const exampleEditColumns: TableColumn[] = [
  {
    id: 'id',
    label: 'ID',
    width: '80px',
    type: 'number',
    editable: false, // ID is readonly
  },
  {
    id: 'spanish',
    label: 'Spanish',
    width: '2fr',
    type: 'text',
  },
  {
    id: 'english',
    label: 'English',
    width: '2fr',
    type: 'text',
  },
  {
    id: 'hasAudio',
    label: 'Audio',
    width: '80px',
    type: 'boolean',
  },
  {
    id: 'spanglish',
    label: 'Spanglish',
    width: '100px',
    type: 'boolean',
  },
  {
    id: 'vocabularyComplete',
    label: 'Vocab Complete',
    width: '120px',
    type: 'boolean',
  },
];

/**
 * Map ExampleTechnical to ExampleEditRow
 * Converts two audio URL fields to single hasAudio boolean
 */
function mapExampleToEditRow(example: ExampleTechnical): ExampleEditRow {
  // hasAudio is true if BOTH audio URLs are present and non-empty
  const hasAudio = !!(example.spanishAudio && example.englishAudio);

  return {
    id: example.id,
    spanish: example.spanish,
    english: example.english,
    hasAudio,
    spanglish: example.spanglish,
    vocabularyComplete: example.vocabularyComplete,
  };
}

/**
 * Map ExampleEditRow back to UpdateExampleCommand
 * Converts hasAudio boolean back to two audio URL fields
 */
function mapEditRowToUpdateCommand(
  row: Partial<ExampleEditRow>,
  audioUrlAdapter: ReturnType<typeof createAudioUrlAdapter>,
): UpdateExampleCommand {
  const exampleId = row.id!;

  // Generate audio URLs from hasAudio boolean
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
    // Note: spanglish is not in UpdateExampleCommand - it's computed server-side
  };
}

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
export function useExampleEditor({
  examples,
  onSave,
}: UseExampleEditorProps): UseExampleEditorResult {
  // State for save operation
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<Error | null>(null);

  // Get the example adapter for saving
  const exampleAdapter = useExampleAdapter();

  // Create audio URL adapter for generating URLs from hasAudio
  const audioUrlAdapter = useMemo(() => createAudioUrlAdapter(), []);

  // Map source examples to edit rows
  const sourceData = useMemo(
    () => examples.map(mapExampleToEditRow),
    [examples],
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
        await exampleAdapter.updateExamples(updateCommands);

        // Call onSave callback if provided
        onSave?.();
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err));
        setSaveError(error);
        throw error; // Re-throw so useEditTable knows it failed
      } finally {
        setIsSaving(false);
      }
    },
    [audioUrlAdapter, exampleAdapter, onSave],
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
    tableHook: editTable,
    discardChanges: editTable.discardChanges,
    applyChanges: editTable.applyChanges,
    hasUnsavedChanges: editTable.hasUnsavedChanges,
    isSaving,
    saveError,
  };
}
