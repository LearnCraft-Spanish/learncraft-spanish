import type { ColumnDisplayConfig } from '@interface/components/EditableTable/types';
import { useExampleEditor } from '@application/useCases/useExampleEditor';
import { PasteTable } from '@interface/components/PasteTable/PasteTable';

/**
 * Display configuration for example editor columns
 */
const exampleDisplayConfig: ColumnDisplayConfig[] = [
  { id: 'id', label: 'ID', width: '80px' },
  { id: 'spanish', label: 'Spanish', width: '2fr' },
  { id: 'english', label: 'English', width: '2fr' },
  { id: 'hasAudio', label: 'Audio', width: '80px' },
  { id: 'spanglish', label: 'Spanglish', width: '100px' },
  { id: 'vocabularyComplete', label: 'Vocab Complete', width: '120px' },
];

export function ExampleEditor() {
  const { editTable } = useExampleEditor();
  return (
    <div>
      <h2>Example Editor</h2>
      <PasteTable hook={editTable} displayConfig={exampleDisplayConfig} />
    </div>
  );
}
