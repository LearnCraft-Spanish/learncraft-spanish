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
 * Custom cell renderer that uses AudioPlaybackCell for audio columns,
 * StandardCell for all others
 */
function renderCell(props: CellRenderProps) {
  const { column } = props;

  // Use custom renderer for audio playback columns
  if (column.id === 'spanishAudio' || column.id === 'englishAudio') {
    return <AudioPlaybackCell {...props} />;
  }

  // Use standard renderer for all other columns
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
        renderCell={renderCell}
      />
    </div>
  );
}
