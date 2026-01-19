import { SelectedExamplesProvider } from '@application/coordinators/providers/SelectedExamplesProvider';
import { ExampleEditor } from '@interface/components/ExampleEditorInterface/ExampleEditor';
import ExampleManagerNav from '@interface/components/ExampleManager/ExampleManagerNav';
import ExampleSearch from '@interface/components/ExampleSearchInterface/ExampleSearch';
import { Route, Routes } from 'react-router-dom';
export function ExampleManagerRouter() {
  return (
    <SelectedExamplesProvider>
      <ExampleManagerNav />
      <Routes>
        {/* <Route path="/" element={<ExampleManagerSetupMenu />} /> */}
        <Route path="search" element={<ExampleSearch />} />
        {/* <Route path="/create" element={<ExampleCreator />} /> */}
        <Route path="edit" element={<ExampleEditor />} />
        {/* <Route path="assign" element={<ExampleAssigner />} /> */}
      </Routes>
    </SelectedExamplesProvider>
  );
}
