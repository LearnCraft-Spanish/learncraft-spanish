import type { UseExampleEditorResult } from '@application/useCases/useExampleEditor/useExampleEditor';
import type { ColumnDefinition, TableRow } from '@domain/PasteTable';
import { createOverrideableMockHook } from '@testing/utils/createOverrideableMockHook';

/**
 * The columns the real hook exposes, so interface tests render the same table.
 * This is a copy of `exampleEditColumns` in `useExampleEditor.ts` (which is not
 * exported); update both together if the real columns change.
 */
export const mockExampleEditorColumns: ColumnDefinition[] = [
  { id: 'id', type: 'read-only', editable: false },
  { id: 'spanish', type: 'textarea', required: true },
  { id: 'english', type: 'textarea', required: true },
  { id: 'hasAudio', type: 'boolean' },
  { id: 'spanishAudio', type: 'text', editable: false, derived: true },
  { id: 'englishAudio', type: 'text', editable: false, derived: true },
  { id: 'relatedVocabulary', type: 'custom', editable: false, derived: true },
  { id: 'vocabularyComplete', type: 'boolean' },
];

/** Builds a table row for an example with sensible, overridable cell values. */
export function createMockExampleEditorRow(
  entityId: number,
  cells: Record<string, string> = {},
): TableRow {
  return {
    id: `row-${entityId}`,
    cells: {
      id: String(entityId),
      spanish: `Spanish ${entityId}`,
      english: `English ${entityId}`,
      hasAudio: 'false',
      spanishAudio: '',
      englishAudio: '',
      spanglish: 'false',
      relatedVocabulary: '[]',
      vocabularyComplete: 'false',
      ...cells,
    },
  };
}

const defaultMockResult: UseExampleEditorResult = {
  tableProps: {
    rows: [createMockExampleEditorRow(1)],
    columns: mockExampleEditorColumns,
    dirtyRowIds: new Set(),
    validationErrors: {},
    onCellChange: () => {},
    hasUnsavedChanges: false,
    isLoading: false,
    isSaving: false,
    isValid: true,
  },
  saveError: null,
  audioErrorHandlers: {
    onAudioError: () => {},
    onAudioSuccess: () => {},
  },
};

export const {
  mock: mockUseExampleEditor,
  override: overrideMockUseExampleEditor,
  reset: resetMockUseExampleEditor,
} = createOverrideableMockHook<[], UseExampleEditorResult>(defaultMockResult);

export default mockUseExampleEditor;
