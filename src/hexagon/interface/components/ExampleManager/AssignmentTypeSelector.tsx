import './ExampleManager.scss';

interface AssignmentTypeSelectorProps {
  assignmentType: 'students' | 'quiz';
  onToggle: () => void;
}

export function AssignmentTypeSelector({
  assignmentType,
  onToggle,
}: AssignmentTypeSelectorProps) {
  return (
    <div className="assignment-type-selector">
      <button type="button" className="toggle-button" onClick={onToggle}>
        {assignmentType === 'students'
          ? 'Switch to Quiz Assignment'
          : 'Switch to Student Assignment'}
        <span className="toggle-arrow">→</span>
      </button>
    </div>
  );
}
