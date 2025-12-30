import { SelectedExamplesProvider } from '@application/coordinators/providers/SelectedExamplesProvider';
import { ExampleEditor } from '@interface/components/ExampleEditorInterface/ExampleEditor';
import ExampleSearch from '@interface/components/ExampleSearchInterface/ExampleSearch';
import { useState } from 'react';
export default function ExampleManagerPage() {
  const [searchOrEdit, setSearchOrEdit] = useState<'search' | 'edit'>('search');
  return (
    <SelectedExamplesProvider>
      {searchOrEdit === 'search' ? (
        <ExampleSearch activateEdit={() => setSearchOrEdit('edit')} />
      ) : (
        <div>
          <ExampleEditor />
          <button type="button" onClick={() => setSearchOrEdit('search')}>
            Back to Search
          </button>
        </div>
      )}
    </SelectedExamplesProvider>
  );
}
