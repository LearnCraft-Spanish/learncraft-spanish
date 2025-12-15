import { useSelectedExamples } from '@application/units/ExampleSearchInterface/useSelectedExamples';
import { BaseResultsComponent } from '@interface/components/ExampleSearchInterface/Results/BaseResultsComponent';

export function SelectedExamples() {
  const { selectedExamples } = useSelectedExamples();
  if (selectedExamples.length === 0) {
    return null;
  }

  return (
    <div>
      <BaseResultsComponent
        title={`${selectedExamples.length} Selected Examples`}
        examples={selectedExamples}
        isLoading={false}
        error={null}
      />
    </div>
  );
}
