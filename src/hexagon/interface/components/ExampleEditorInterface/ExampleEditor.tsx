import { useExampleEditor } from '@application/useCases/useExampleEditor';
import { PasteTable } from '@interface/components/PasteTable/PasteTable';

export function ExampleEditor() {
  const { editTable } = useExampleEditor();
  return (
    <div>
      <h2>Example Editor</h2>
      <PasteTable hook={editTable} />
    </div>
  );
}
