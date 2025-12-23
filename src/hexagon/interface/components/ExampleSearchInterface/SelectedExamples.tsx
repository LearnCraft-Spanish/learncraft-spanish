import { useSelectedExamples } from '@application/units/ExampleSearchInterface/useSelectedExamples';
import { BaseResultsComponent } from '@interface/components/ExampleSearchInterface/Results/BaseResultsComponent';
import SectionHeader from '@interface/components/general/SectionHeader/SectionHeader';
import { useState } from 'react';
export function SelectedExamples() {
  const [showSelectedExamples, setShowSelectedExamples] = useState(true);
  const { selectedExamples } = useSelectedExamples();
  if (selectedExamples.length === 0) {
    return null;
  }

  return (
    <div>
      <SectionHeader
        title="Selected Examples"
        isOpen={showSelectedExamples}
        openFunction={() => setShowSelectedExamples(!showSelectedExamples)}
      />
      {showSelectedExamples && (
        <BaseResultsComponent
          title={`${selectedExamples.length} Selected Examples`}
          examples={selectedExamples}
          isLoading={false}
          error={null}
        />
      )}
    </div>
  );
}
