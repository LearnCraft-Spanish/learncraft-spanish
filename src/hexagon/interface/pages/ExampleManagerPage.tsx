import { SelectedExamplesProvider } from '@application/coordinators/providers/SelectedExamplesProvider';
import ExampleAssigner from '@interface/components/ExampleAssignerInterface/ExampleAssigner';
import ExampleCreator from '@interface/components/ExampleCreatorInterface/ExampleCreator';
import { ExampleEditor } from '@interface/components/ExampleEditorInterface/ExampleEditor';
import ExampleManagerNav from '@interface/components/ExampleManager/ExampleManagerNav';
import ExampleSearch from '@interface/components/ExampleSearchInterface/ExampleSearch';
import { useCallback, useState } from 'react';
import { Route, Routes } from 'react-router-dom';
export default function ExampleManagerRouter() {
  const [hasUnsavedCreatedExamples, setHasUnsavedCreatedExamples] =
    useState(false);
  const [hasUnsavedEditedExamples, setHasUnsavedEditedExamples] =
    useState(false);

  const handleSetHasUnsavedCreatedExamples = useCallback(
    (hasUnsavedCreatedExamples: boolean) => {
      setHasUnsavedCreatedExamples(hasUnsavedCreatedExamples);
    },
    [],
  );

  const handleSetHasUnsavedEditedExamples = useCallback(
    (hasUnsavedEditedExamples: boolean) => {
      setHasUnsavedEditedExamples(hasUnsavedEditedExamples);
    },
    [],
  );
  return (
    <SelectedExamplesProvider>
      <ExampleManagerNav
        hasUnsavedCreatedExamples={hasUnsavedCreatedExamples}
        setHasUnsavedCreatedExamples={handleSetHasUnsavedCreatedExamples}
        hasUnsavedEditedExamples={hasUnsavedEditedExamples}
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
        <Route
          path="edit"
          element={
            <ExampleEditor
              setHasUnsavedEditedExamples={handleSetHasUnsavedEditedExamples}
            />
          }
        />
        <Route path="assign" element={<ExampleAssigner />} />
      </Routes>
    </SelectedExamplesProvider>
  );
}
