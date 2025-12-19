import type {
  CellRenderProps,
  ColumnDisplayConfig,
} from '@interface/components/EditableTable/types';
import { useExampleEditor } from '@application/useCases/useExampleEditor';
import {
  EditableTable,
  StandardCell,
} from '@interface/components/EditableTable';
import { AudioPlaybackCell } from '@interface/components/ExampleEditorInterface/AudioPlaybackCell';

/**
 * Display configuration for example editor columns
 * Defines labels and widths for each column in the table UI
 */
const exampleDisplayConfig: ColumnDisplayConfig[] = [
  { id: 'id', label: 'ID', width: '80px' },
  { id: 'spanish', label: 'Spanish', width: '2fr' },
  { id: 'english', label: 'English', width: '2fr' },
  { id: 'hasAudio', label: 'Audio', width: '80px' },
  { id: 'spanishAudio', label: 'Spanish Audio', width: '100px' },
  { id: 'englishAudio', label: 'English Audio', width: '100px' },
  { id: 'spanglish', label: 'Spanglish', width: '100px' },
  { id: 'vocabularyComplete', label: 'Vocab Complete', width: '120px' },
];

/**
 * Cell renderer function for example editor table
 *
 * This function is called by EditableTable for each cell to determine which
 * component to render. It receives CellRenderProps containing:
 * - Cell value, row data, column definition
 * - Focus state, validation errors, dirty state
 * - Event handlers (onChange, onFocus, onBlur)
 *
 * Pattern: The render function allows interface-layer customization of cell
 * rendering without modifying the generic EditableTable component. This keeps
 * the table reusable while allowing use-case-specific cell types.
 *
 * Flow: ExampleEditor → EditableTable → EditableTableRow → renderCell()
 *
 * @param props - Cell rendering props from EditableTableRow
 * @returns React component for the cell (AudioPlaybackCell or StandardCell)
 */
function renderExampleEditorCell(props: CellRenderProps) {
  const { column } = props;

  // Audio URL columns: Use custom playback component (read-only, displays audio player)
  // These columns are marked as 'derived' in column definitions (see useExampleEditor)
  if (column.id === 'spanishAudio' || column.id === 'englishAudio') {
    return <AudioPlaybackCell {...props} />;
  }

  // All other columns: Use standard editable cell component
  // Handles text, textarea, boolean, number, date, etc. based on column.type
  return <StandardCell {...props} />;
}

export function ExampleEditor() {
  const { editTable, isLoading, isSaving, saveError } = useExampleEditor();

  return (
    <div>
      <h2>Example Editor</h2>
      {saveError && (
        <div className="paste-table--error">
          <p>Error saving: {saveError.message}</p>
        </div>
      )}
      <EditableTable
        rows={editTable.data.rows}
        columns={editTable.data.columns}
        displayConfig={exampleDisplayConfig}
        dirtyRowIds={editTable.dirtyRowIds}
        validationErrors={editTable.validationState.errors}
        onCellChange={editTable.updateCell}
        onPaste={editTable.handlePaste}
        setActiveCellInfo={editTable.setActiveCellInfo}
        clearActiveCellInfo={editTable.clearActiveCellInfo}
        hasUnsavedChanges={editTable.hasUnsavedChanges}
        onSave={editTable.applyChanges}
        onDiscard={editTable.discardChanges}
        isLoading={isLoading}
        isSaving={isSaving}
        isValid={editTable.validationState.isValid}
        renderCell={renderExampleEditorCell}
      />
    </div>
  );
}
