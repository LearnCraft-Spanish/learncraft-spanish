import { SelectedExamplesProvider } from '@application/coordinators/providers/SelectedExamplesProvider';
import ExampleCreator from '@interface/components/ExampleCreatorInterface/ExampleCreator';
import { ExampleEditor } from '@interface/components/ExampleEditorInterface/ExampleEditor';
import ExampleManagerNav from '@interface/components/ExampleManager/ExampleManagerNav';
import ExampleSearch from '@interface/components/ExampleSearchInterface/ExampleSearch';
import { useCallback, useState } from 'react';
import { Route, Routes } from 'react-router-dom';
export function ExampleManagerRouter() {
  const [hasUnsavedCreatedExamples, setHasUnsavedCreatedExamples] =
    useState(false);

  const handleSetHasUnsavedCreatedExamples = useCallback(
    (hasUnsavedCreatedExamples: boolean) => {
      setHasUnsavedCreatedExamples(hasUnsavedCreatedExamples);
    },
    [],
  );
  return (
    <SelectedExamplesProvider>
      <ExampleManagerNav
        hasUnsavedCreatedExamples={hasUnsavedCreatedExamples}
        setHasUnsavedCreatedExamples={handleSetHasUnsavedCreatedExamples}
      />
      <Routes>
        {/* <Route path="/" element={<ExampleManagerSetupMenu />} /> */}
        <Route path="search" element={<ExampleSearch />} />
        <Route
          path="create"
          element={
            <ExampleCreator
              setHasUnsavedCreatedExamples={handleSetHasUnsavedCreatedExamples}
            />
          }
        />
        <Route path="edit" element={<ExampleEditor />} />
        {/* <Route path="assign" element={<ExampleAssigner />} /> */}
      </Routes>
    </SelectedExamplesProvider>
  );
}
