import { SelectedExamplesProvider } from '@application/coordinators/providers/SelectedExamplesProvider';
import ExampleSearch from '@interface/components/ExampleSearchInterface/ExampleSearch';
export default function ExampleManagerPage() {
  return (
    <SelectedExamplesProvider>
      <ExampleSearch />
    </SelectedExamplesProvider>
  );
}
