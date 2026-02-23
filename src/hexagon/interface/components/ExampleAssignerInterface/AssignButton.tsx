interface AssignButtonProps {
  assignmentType: 'students' | 'quiz';
  unassignedCount: number;
  isAssigning: boolean;
  canAssign: boolean;
  activeStudentName?: string | null;
  quizName?: string | null;
  onClick: () => void;
}

export function AssignButton({
  assignmentType,
  unassignedCount,
  isAssigning,
  canAssign,
  activeStudentName,
  quizName,
  onClick,
}: AssignButtonProps) {
  const getButtonText = () => {
    if (isAssigning) {
      return 'Assigning...';
    }

    if (assignmentType === 'students') {
      if (!activeStudentName) {
        return 'Please select a student first';
      }
      return `Assign ${unassignedCount} Examples to ${activeStudentName}`;
    }

    if (!quizName) {
      return 'Please select a quiz first';
    }
    return `Assign ${unassignedCount} Examples to Quiz: ${quizName}`;
  };

  return (
    <div className="buttonBox">
      <button type="button" onClick={onClick} disabled={!canAssign}>
        {getButtonText()}
      </button>
    </div>
  );
}
