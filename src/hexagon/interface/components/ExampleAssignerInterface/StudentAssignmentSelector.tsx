import { SubHeaderComponent } from '@interface/components/SubHeader';

interface StudentAssignmentSelectorProps {
  isLoading: boolean;
}

export function StudentAssignmentSelector({
  isLoading,
}: StudentAssignmentSelectorProps) {
  return (
    <div>
      <p>Select a student to assign these examples to:</p>
      <SubHeaderComponent />
      {isLoading && <p>Loading student...</p>}
    </div>
  );
}
