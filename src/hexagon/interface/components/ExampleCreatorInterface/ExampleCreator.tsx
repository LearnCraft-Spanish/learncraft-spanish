import type {
  CellRenderProps,
  ColumnDisplayConfig,
} from '@interface/components/EditableTable/types';
import { useExampleCreator } from '@application/useCases/useExampleCreator';
import { CreateTable } from '@interface/components/CreateTable/CreateTable';
import { StandardCell } from '@interface/components/EditableTable';
import { ExampleCreatorHelpContextual } from '@interface/components/ExampleCreatorInterface/ExampleCreatorHelpContextual';
import { BaseResultsComponent } from '@interface/components/ExampleSearchInterface/Results/BaseResultsComponent';

const exampleDisplayConfig: ColumnDisplayConfig[] = [
  { id: 'spanish', label: 'Spanish', width: '50%' },
  { id: 'english', label: 'English', width: '50%' },
];
export default function ExampleCreator() {
  const { tableProps, selectedExamples, isFetchingExamples } = useExampleCreator();

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
