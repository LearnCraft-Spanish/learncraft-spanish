import type {
  BaseAssignment,
  FurnishedWeekWithCoach,
} from '@learncraft-spanish/shared';

import { AssignmentView } from '@interface/components/CoachingRecords';
import { useContextualMenu } from '@interface/hooks/useContextualMenu';

export function AssignmentCell({
  week,
  assignment,
  tableEditMode,
}: {
  week: FurnishedWeekWithCoach;
  assignment: BaseAssignment;
  tableEditMode: boolean;
}): React.JSX.Element {
  const { openContextual, contextual } = useContextualMenu();

  return (
    <div className="cellWithContextual">
      <button
        type="button"
        onClick={() => openContextual(`assignment${assignment.assignmentId}`)}
      >
        {`${assignment.assignmentType.assignmentType}: ${assignment.assignmentRating.assignmentRating}`}
      </button>
      {contextual === `assignment${assignment.assignmentId}` && (
        <AssignmentView
          assignment={assignment}
          tableEditMode={tableEditMode}
          displayContext={{ studentName: week.student?.fullName }}
        />
      )}
    </div>
  );
}

export default function AssignmentsCell({
  week,
  assignments,
  tableEditMode,
}: {
  week: FurnishedWeekWithCoach;
  assignments: BaseAssignment[] | null | undefined;
  tableEditMode: boolean;
}): React.JSX.Element {
  return (
    <div className="assignmentsCell">
      {!!assignments &&
        assignments.map((assignment) => (
          <AssignmentCell
            week={week}
            assignment={assignment}
            tableEditMode={tableEditMode}
            key={`assignment${assignment.assignmentId}`}
          />
        ))}
    </div>
  );
}
