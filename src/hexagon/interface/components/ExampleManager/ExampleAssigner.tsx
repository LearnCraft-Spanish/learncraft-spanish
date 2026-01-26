import { useExampleAssigner } from '@application/useCases/useExampleAssigner/useExampleAssigner';
import { AssignButton } from '@interface/components/ExampleManager/AssignButton';
import { AssignedExamplesTable } from '@interface/components/ExampleManager/AssignedExamplesTable';
import { AssignmentTypeSelector } from '@interface/components/ExampleManager/AssignmentTypeSelector';
import { ExamplesToAssignTable } from '@interface/components/ExampleManager/ExamplesToAssignTable';
import { QuizAssignmentSelector } from '@interface/components/ExampleManager/QuizAssignmentSelector';
import { StudentAssignmentSelector } from '@interface/components/ExampleManager/StudentAssignmentSelector';
import { useModal } from '@interface/hooks/useModal';
import './ExampleManager.scss';

export default function ExampleAssigner() {
  const {
    assignmentType,
    toggleAssignmentType,
    selectedCourseCode,
    setSelectedCourseCode,
    selectedQuizRecordId,
    setSelectedQuizRecordId,
    selectedQuizRecord,
    availableQuizzes,
    selectedExamples,
    isFetchingSelectedExamples,
    assignedExamples,
    isLoadingAssignedExamples,
    assignedExamplesError,
    activeStudent,
    isLoadingActiveStudent,
    assignExamples,
    isAssigning,
    assigningError,
    courseOptions,
  } = useExampleAssigner();

  const { openModal, closeModal } = useModal();

  // Filter out examples that are already assigned
  const unassignedExamples = selectedExamples.filter((example) => {
    if (!assignedExamples) return true;
    return !assignedExamples.some((assigned) => assigned.id === example.id);
  });

  const targetName =
    assignmentType === 'students'
      ? activeStudent?.name || 'Student'
      : selectedQuizRecord?.quizNickname ||
        `Quiz ${selectedQuizRecord?.quizNumber}` ||
        'Quiz';

  const handleAssign = () => {
    if (unassignedExamples.length === 0) {
      return;
    }

    openModal({
      title: 'Confirm Assignment',
      body: `Are you sure you want to assign ${unassignedExamples.length} example${unassignedExamples.length !== 1 ? 's' : ''} to ${targetName}?`,
      type: 'confirm',
      confirmFunction: async () => {
        try {
          await assignExamples();
          closeModal();
        } catch (error) {
          console.error('Failed to assign examples:', error);
        }
      },
      cancelFunction: () => {
        closeModal();
      },
    });
  };

  const canAssign: boolean =
    selectedExamples.length > 0 &&
    unassignedExamples.length > 0 &&
    !isAssigning &&
    ((assignmentType === 'students' && activeStudent !== null) ||
      (assignmentType === 'quiz' && selectedQuizRecord !== undefined));

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

      <AssignmentTypeSelector
        assignmentType={assignmentType}
        onToggle={toggleAssignmentType}
      />

      {assignmentType === 'students' && (
        <StudentAssignmentSelector isLoading={isLoadingActiveStudent} />
      )}

      {assignmentType === 'quiz' && (
        <QuizAssignmentSelector
          selectedCourseCode={selectedCourseCode}
          onCourseCodeChange={setSelectedCourseCode}
          selectedQuizRecordId={selectedQuizRecordId}
          onQuizRecordIdChange={setSelectedQuizRecordId}
          availableQuizzes={availableQuizzes}
          courseOptions={courseOptions}
        />
      )}

      <ExamplesToAssignTable examples={unassignedExamples} />

      <AssignButton
        assignmentType={assignmentType}
        unassignedCount={unassignedExamples.length}
        isAssigning={isAssigning}
        canAssign={canAssign}
        activeStudentName={activeStudent?.name}
        quizName={
          selectedQuizRecord?.quizNickname ||
          (selectedQuizRecord?.quizNumber
            ? `Quiz ${selectedQuizRecord.quizNumber}`
            : null)
        }
        onClick={handleAssign}
      />

      <AssignedExamplesTable
        examples={assignedExamples}
        isLoading={isLoadingAssignedExamples}
        error={assignedExamplesError}
        targetName={targetName}
      />

      {assigningError && (
        <div className="error">
          Error assigning examples: {assigningError.message}
        </div>
      )}
    </div>
  );
}
