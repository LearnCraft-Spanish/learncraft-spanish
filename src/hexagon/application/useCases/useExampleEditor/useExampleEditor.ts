import type { EditTableHook } from '@application/units/pasteTable/useEditTable';
import type { TableColumn } from '@domain/PasteTable/General';
import type {
  ExampleTechnical,
  UpdateExampleCommand,
} from '@learncraft-spanish/shared';
import { useExampleAdapter } from '@application/adapters/exampleAdapter';
import { useEditTable } from '@application/units/pasteTable/useEditTable';
import { createAudioUrlAdapter } from '@domain/PasteTable/functions/audioUrlAdapter';
import { updateExampleCommandSchema } from '@learncraft-spanish/shared';
import { useCallback, useMemo, useState } from 'react';
import { z } from 'zod';

/**
 * Table row type for editing examples
 * Uses hasAudio boolean instead of two separate URL fields
 */
export interface ExampleEditRow extends Record<string, unknown> {
  /** Domain ID for matching during edit operations */
  id: number;
  /** Spanish example text */
  spanish: string;
  /** English translation */
  english: string;
  /** Single boolean to represent audio availability */
  hasAudio: boolean;
  /** Whether this is a spanglish example */
  spanglish: boolean;
  /** Whether vocabulary is complete for this example */
  vocabularyComplete: boolean;
}

/**
 * Props for the useExampleEditor hook
 */
export interface UseExampleEditorProps {
  /** Source examples from TanStack query */
  examples: ExampleTechnical[];
  /** Callback when examples are saved */
  onSave?: () => void;
}

/**
 * Return type for the useExampleEditor hook
 */
export interface UseExampleEditorResult {
  /** The edit table hook with all table operations */
  tableHook: EditTableHook<ExampleEditRow>;
  /** Discard all changes and revert to source data */
  discardChanges: () => void;
  /** Apply changes - saves dirty rows */
  applyChanges: () => Promise<void>;
  /** Whether the table has unsaved changes */
  hasUnsavedChanges: boolean;
  /** Whether save is in progress */
  isSaving: boolean;
  /** Error from save operation */
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
