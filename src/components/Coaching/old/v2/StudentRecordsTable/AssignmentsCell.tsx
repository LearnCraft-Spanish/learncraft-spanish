import { useContextualMenu } from '../../../hooks/useContextualMenu';
import type { Assignment } from '../CoachingTypes';
interface AssignmentsCellProps {
  data: Assignment[];
  getStudentFromMembershipId: (membershipId: number) => any;
  getMembershipFromWeekId: (weekId: number) => any;
  openAssignmentPopup: (recordId: number) => void;
}
export default function AssignmentsCell({
  data,
  getStudentFromMembershipId,
  getMembershipFromWeekId,
  openAssignmentPopup,
}: AssignmentsCellProps) {
  const { contextual, closeContextual, setContextualRef } = useContextualMenu();
  //recives assignments from getAssignmentsFromWeekId
  if (data.length === 0) {
    return null;
  } else {
    return data.map((assignment) => (
      <div className="assignmentBox" key={assignment.recordId}>
        <button
          type="button"
          onClick={() => openAssignmentPopup(assignment.recordId)}
        >
          {assignment.assignmentType}:{assignment.rating}
        </button>
        {contextual === `assignment${assignment.recordId}` && (
          <div className="assignmentPopup" ref={setContextualRef}>
            <h4>
              {assignment.assignmentType} by{' '}
              {
                getStudentFromMembershipId(
                  getMembershipFromWeekId(assignment.relatedWeek).recordId,
                ).fullName
              }
            </h4>
            {/* Currently, .date does not exist on assignment */}
            {/* <p>{assignment.date}</p> */}
            {assignment.homeworkCorrector && (
              <p>
                Corrected by
                {assignment.homeworkCorrector.name}
              </p>
            )}
            <p>
              Rating:
              {assignment.rating}
            </p>
            <p>
              Notes:
              {assignment.notes}
            </p>
            <p>
              Areas of Difficulty:
              {assignment.areasOfDifficulty}
            </p>
            {(assignment.assignmentLink
              ? assignment.assignmentLink.length > 0
              : false) && (
              <a target="_blank" href={assignment.assignmentLink}>
                Assignment Link
              </a>
            )}
            <div className="buttonBox">
              <button
                type="button"
                className="redButton"
                onClick={closeContextual}
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    ));
  }
}
