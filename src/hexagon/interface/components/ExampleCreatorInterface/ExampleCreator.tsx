import type { ColumnDisplayConfig } from '@interface/components/EditableTable/types';
import {CreateTable} from '@interface/components/CreateTable/CreateTable';
const exampleDisplayConfig: ColumnDisplayConfig[] = [
  { id: 'spanish', label: 'spanish', width: '50%' },
  { id: 'english', label: 'english', width: '50%' },
];
export default function ExampleCreator() {
  return <div>
    <h2>Example Creator</h2>
    <CreateTable
    displayConfig={exampleDisplayConfig}
   
    />
  </div>;
}