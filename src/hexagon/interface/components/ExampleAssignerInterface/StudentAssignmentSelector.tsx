import { useActiveStudent } from '@application/coordinators/hooks/useActiveStudent';
import StudentSelector from '@interface/components/ExampleAssignerInterface/StudentSelector';
import { useCallback } from 'react';
import '@interface/components/ExampleAssignerInterface/StudentSelector.scss';

interface StudentAssignmentSelectorProps {
  isLoading: boolean;
}

export function StudentAssignmentSelector({
  isLoading,
}: StudentAssignmentSelectorProps) {
  const { appUser, changeActiveStudent } = useActiveStudent();

  const handleStudentSelect = useCallback(
    (studentEmail: string | null) => {
      changeActiveStudent(studentEmail);
    },
    [changeActiveStudent],
  );

  return (
    <div className="student-selector-component-container">
      <p>Select a student to assign these examples to:</p>
      <StudentSelector
        onStudentSelect={handleStudentSelect}
        selectedStudentEmail={appUser?.emailAddress || null}
      />
      {isLoading && <p>Loading student...</p>}
    </div>
  );
}
