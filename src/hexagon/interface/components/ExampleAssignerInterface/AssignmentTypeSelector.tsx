import type { AssignmentType } from '@application/useCases/useExampleAssigner/useExampleAssigner';
import '@interface/components/ExampleManager/ExampleManagerSubNav.scss';

interface NavOption {
  type: AssignmentType;
  label: string;
}

const NAV_OPTIONS: NavOption[] = [
  { type: 'students', label: 'Student Assignment' },
  { type: 'quiz', label: 'Quiz Assignment' },
];

interface AssignmentTypeSelectorProps {
  assignmentType: AssignmentType;
  onTypeChange: (type: AssignmentType) => void;
}

export function AssignmentTypeSelector({
  assignmentType,
  onTypeChange,
}: AssignmentTypeSelectorProps) {
  return (
    <div className="ExampleManagerSubNav">
      {NAV_OPTIONS.map((option) => (
        <label
          key={option.type}
          className={`ExampleManagerSubNavOption ${assignmentType === option.type ? 'selected' : ''}`}
        >
          <input
            type="radio"
            name="assignmentType"
            value={option.type}
            checked={assignmentType === option.type}
            onChange={() => onTypeChange(option.type)}
          />
          <span>{option.label}</span>
        </label>
      ))}
    </div>
  );
}
