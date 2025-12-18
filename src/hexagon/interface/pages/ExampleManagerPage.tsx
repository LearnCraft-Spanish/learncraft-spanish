import { SelectedExamplesProvider } from '@application/coordinators/providers/SelectedExamplesProvider';
import ExampleSearch from '@interface/components/ExampleSearchInterface/ExampleSearch';
import { useState } from 'react';
export default function ExampleManagerPage() {
  const [searchOrEdit, setSearchOrEdit] = useState<'search' | 'edit'>('search');
  return (
    <SelectedExamplesProvider>
      {searchOrEdit === 'search' ? (
        <ExampleSearch activateEdit={() => setSearchOrEdit('edit')} />
      ) : (
        // <ExampleEditor activateSearch={() => setSearchOrEdit('search')} />
        <div>Editor Interface Coming Soon</div>
      )}
    </SelectedExamplesProvider>
  );
}
