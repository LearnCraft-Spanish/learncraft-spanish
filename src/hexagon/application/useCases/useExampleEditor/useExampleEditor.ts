import type { EditTableHook } from '@application/units/pasteTable/useEditTable';
import type { ExampleEditRow } from '@domain/PasteTable/exampleEditRow';
import type { TableColumn } from '@domain/PasteTable/General';
import { useSelectedExamplesContext } from '@application/coordinators/hooks/useSelectedExamplesContext';
import { useExampleMutations } from '@application/queries/ExampleQueries/useExampleMutations';
import { useExamplesToEditQuery } from '@application/queries/ExampleQueries/useExamplesToEditQuery';
import { useEditTable } from '@application/units/pasteTable/useEditTable';
import {
  mapEditRowToUpdateCommand,
  mapExampleToEditRow,
} from '@domain/PasteTable/exampleEditRow';
import { createAudioUrlAdapter } from '@domain/PasteTable/functions/audioUrlAdapter';
import { updateExampleCommandSchema } from '@learncraft-spanish/shared';
import { useCallback, useMemo, useState } from 'react';
import { z } from 'zod';

export type { ExampleEditRow };

/**
 * Return type for the useExampleEditor hook
 */
export interface UseExampleEditorResult {
  /** The edit table hook with all table operations */
  editTable: EditTableHook<ExampleEditRow>;
  isSaving: boolean;
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
    isLoading: _isLoadingExamplesToEdit,
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
        await updateExamples.mutateAsync(updateCommands);
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
    isSaving,
    saveError,
  };
}
