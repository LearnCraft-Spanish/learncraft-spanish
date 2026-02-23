import { useExampleAssigner } from '@application/useCases/useExampleAssigner/useExampleAssigner';
import { AssignButton } from '@interface/components/ExampleAssignerInterface/AssignButton';
import { AssignedQuizExamplesTable } from '@interface/components/ExampleAssignerInterface/AssignedQuizExamplesTable';
import { AssignedStudentFlashcardsTable } from '@interface/components/ExampleAssignerInterface/AssignedStudentFlashcardsTable';
import { AssignmentTypeSelector } from '@interface/components/ExampleAssignerInterface/AssignmentTypeSelector';
import { ExamplesToAssignTable } from '@interface/components/ExampleAssignerInterface/ExamplesToAssignTable';
import { QuizAssignmentSelector } from '@interface/components/ExampleAssignerInterface/QuizAssignmentSelector';
import { StudentAssignmentSelector } from '@interface/components/ExampleAssignerInterface/StudentAssignmentSelector';
import { useModal } from '@interface/hooks/useModal';

export default function ExampleAssigner() {
  const {
    selectedExamples,
    isFetchingSelectedExamples,
    assignmentTypeSelectorProps,
    studentSelectionProps,
    quizSelectionProps,
    assignedStudentFlashcardsProps,
    assignedQuizExamplesProps,
    unassignedExamplesProps,
    assignButtonProps,
    assignExamples,
    assigningError,
  } = useExampleAssigner();

  const { openModal, closeModal } = useModal();

  const handleAssign = () => {
    if (unassignedExamplesProps.examples.length === 0) {
      return;
    }

    const targetName =
      assignmentTypeSelectorProps.assignmentType === 'students'
        ? assignedStudentFlashcardsProps?.targetName || 'Student'
        : assignedQuizExamplesProps?.targetName || 'Quiz';

    openModal({
      title: 'Confirm Assignment',
      body: `Are you sure you want to assign ${unassignedExamplesProps.examples.length} example${unassignedExamplesProps.examples.length !== 1 ? 's' : ''} to ${targetName}?`,
      type: 'confirm',
      confirmFunction: async () => {
        closeModal();
        await assignExamples();
      },
      cancelFunction: () => {
        closeModal();
      },
    });
  };

  if (isFetchingSelectedExamples) {
    return <div>Loading selected examples...</div>;
  }

  if (selectedExamples.length === 0) {
    return (
      <div className="assignment-section">
        <h3>Assign Examples</h3>
        <p>
          No examples selected. Please select examples from the search page.
        </p>
      </div>
    );
  }

  return (
    <div className="assignment-section">
      <h3>Assign Examples</h3>

      <AssignmentTypeSelector {...assignmentTypeSelectorProps} />

      {assignmentTypeSelectorProps.assignmentType === 'students' && (
        <StudentAssignmentSelector {...studentSelectionProps} />
      )}

      {assignmentTypeSelectorProps.assignmentType === 'quiz' && (
        <QuizAssignmentSelector {...quizSelectionProps} />
      )}

      <ExamplesToAssignTable {...unassignedExamplesProps} />

      <AssignButton {...assignButtonProps} onClick={handleAssign} />

      {assignedStudentFlashcardsProps && (
        <AssignedStudentFlashcardsTable {...assignedStudentFlashcardsProps} />
      )}

      {assignedQuizExamplesProps && (
        <AssignedQuizExamplesTable {...assignedQuizExamplesProps} />
      )}

      {assigningError && (
        <div className="error">
          Error assigning examples: {assigningError.message}
        </div>
      )}
    </div>
  );
}
