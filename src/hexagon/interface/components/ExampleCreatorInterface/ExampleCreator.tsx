import type { CellRenderProps, ColumnDisplayConfig } from '@interface/components/EditableTable/types';
import {useExampleCreator} from '@application/useCases/useExampleCreator';
import {CreateTable} from '@interface/components/CreateTable/CreateTable';
import { StandardCell } from '@interface/components/EditableTable';
const exampleDisplayConfig: ColumnDisplayConfig[] = [
  { id: 'spanish', label: 'Spanish', width: '50%' },
  { id: 'english', label: 'English', width: '50%' },
];
export default function ExampleCreator() {
  const { tableProps } = useExampleCreator();

  const renderCell = (props: CellRenderProps) => {
    return <StandardCell {...props} />;
  };
  return <div>
    <h2>Example Creator</h2>
    <CreateTable
    displayConfig={exampleDisplayConfig}
    renderCell={renderCell}
    {...tableProps}
    />
  </div>;
}