import type {
  CellRenderProps,
  ColumnDisplayConfig,
} from '@interface/components/EditableTable/types';
import useVocabulary from '@application/units/useVocabulary/useVocabulary';
import { useExampleEditor } from '@application/useCases/useExampleEditor';
import {
  EditableTable,
  StandardCell,
} from '@interface/components/EditableTable';
import { AudioPlaybackCell } from '@interface/components/ExampleEditorInterface/AudioPlaybackCell';
import { RelatedVocabularyCell } from '@interface/components/ExampleEditorInterface/RelatedVocabularyCell';
import { useCallback } from 'react';

/**
 * Display configuration for example editor columns
 * Defines labels and widths for each column in the table UI
 */
const exampleDisplayConfig: ColumnDisplayConfig[] = [
  { id: 'id', label: 'ID', width: '80px' },
  { id: 'spanish', label: 'Spanish', width: '2fr' },
  { id: 'english', label: 'English', width: '2fr' },
  { id: 'hasAudio', label: 'Audio', width: '80px' },
  { id: 'spanishAudio', label: 'Spanish Audio', width: '80px' },
  { id: 'englishAudio', label: 'English Audio', width: '80px' },
  { id: 'spanglish', label: 'Spanglish', width: '100px' },
  { id: 'vocabularyComplete', label: 'Vocab Complete', width: '100px' },
  { id: 'relatedVocabulary', label: 'Related Vocabulary', width: '2fr' },
];

export function ExampleEditor() {
  const {
    tableProps,
    saveError,
    audioErrorHandlers,
  } = useExampleEditor();

  const { vocabulary: vocabularyList } = useVocabulary();

  // Business logic: handle vocabulary add/remove for relatedVocabulary column
  // The cell value is stored as JSON string "[1,2,3]" which we parse/stringify
  const handleVocabularyAdd = useCallback(
    (rowId: string, vocabId: number) => {
      const row = tableProps.rows.find((r) => r.id === rowId);
      if (!row) return;

      const currentIds: number[] = (() => {
        const value = row.cells.relatedVocabulary || '';
        if (!value) return [];
        try {
          return JSON.parse(value);
        } catch {
          return [];
        }
      })();

      if (!currentIds.includes(vocabId)) {
        const newIds = [...currentIds, vocabId];
        tableProps.onCellChange(
          rowId,
          'relatedVocabulary',
          JSON.stringify(newIds),
        );
      }
    },
    [tableProps],
  );

  const handleVocabularyRemove = useCallback(
    (rowId: string, vocabId: number) => {
      const row = tableProps.rows.find((r) => r.id === rowId);
      if (!row) return;

      const currentIds: number[] = (() => {
        const value = row.cells.relatedVocabulary || '';
        if (!value) return [];
        try {
          return JSON.parse(value);
        } catch {
          return [];
        }
      })();

      const newIds = currentIds.filter((id) => id !== vocabId);
      tableProps.onCellChange(rowId, 'relatedVocabulary', JSON.stringify(newIds));
    },
    [tableProps],
  );

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
  const renderCellWithSpecialHandlers = (props: CellRenderProps) => {
    const { column } = props;

    if (column.id === 'spanishAudio' || column.id === 'englishAudio') {
      return (
        <AudioPlaybackCell {...props} audioErrorHandlers={audioErrorHandlers} />
      );
    }

    if (column.id === 'relatedVocabulary') {
      return (
        <RelatedVocabularyCell
          value={props.value}
          vocabularyList={vocabularyList}
          onVocabularyAdd={(vocabId) =>
            handleVocabularyAdd(props.row.id, vocabId)
          }
          onVocabularyRemove={(vocabId) =>
            handleVocabularyRemove(props.row.id, vocabId)
          }
          rowId={props.row.id}
        />
      );
    }

    return <StandardCell {...props} />;
  };

  return (
    <div>
      <h2>Example Editor</h2>
      {saveError && (
        <div className="paste-table--error">
          <p>Error saving: {saveError.message}</p>
        </div>
      )}
      <EditableTable
        {...tableProps}
        displayConfig={exampleDisplayConfig}
        renderCell={renderCellWithSpecialHandlers}
      />
    </div>
  );
}
