import type {
  CellRenderProps,
  ColumnDisplayConfig,
} from '@interface/components/EditableTable/types';
import { GHOST_ROW_ID } from '@application/units/pasteTable/constants';
import { useExampleCreator } from '@application/useCases/useExampleCreator';
import { CreateTable } from '@interface/components/CreateTable/CreateTable';
import { StandardCell } from '@interface/components/EditableTable';
import { ExampleCreatorHelpContextual } from '@interface/components/ExampleCreatorInterface/ExampleCreatorHelpContextual';
import { BaseResultsComponent } from '@interface/components/ExampleSearchInterface/Results/BaseResultsComponent';
import { useEffect } from 'react';

const exampleDisplayConfig: ColumnDisplayConfig[] = [
  { id: 'spanish', label: 'Spanish', width: '50%' },
  { id: 'english', label: 'English', width: '50%' },
];
export default function ExampleCreator({
  setHasUnsavedCreatedExamples,
}: {
  setHasUnsavedCreatedExamples: (hasUnsavedCreatedExamples: boolean) => void;
}) {
  const { tableProps, selectedExamples, isFetchingExamples } =
    useExampleCreator();

  // This will set hasUnsavedCreatedExamples to true if there are any rows in the table that are not the ghost row (unsaved exampels)
  useEffect(() => {
    if (tableProps.rows.filter((row) => row.id !== GHOST_ROW_ID).length > 0) {
      setHasUnsavedCreatedExamples(true);
    }
  }, [tableProps.rows, setHasUnsavedCreatedExamples]);

  const renderCell = (props: CellRenderProps) => {
    return <StandardCell {...props} />;
  };
  return (
    <div>
      <h2>Example Creator</h2>
      <ExampleCreatorHelpContextual />
      <CreateTable
        displayConfig={exampleDisplayConfig}
        renderCell={renderCell}
        {...tableProps}
      />
      <BaseResultsComponent
        bulkOption="deselectAll"
        title={`${selectedExamples.length} Selected Examples`}
        examples={selectedExamples}
        isLoading={isFetchingExamples}
        error={null}
      />
    </div>
  );
}
