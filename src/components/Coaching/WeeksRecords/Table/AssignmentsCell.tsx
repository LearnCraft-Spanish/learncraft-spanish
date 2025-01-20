import type { Assignment, Week } from '../../../../types/CoachingTypes';
import { useContextualMenu } from 'src/hooks/useContextualMenu';
import useCoaching from 'src/hooks/CoachingData/useCoaching';
import ContextualControlls from '../../../ContextualControlls';
export default function AssignmentsCell({
  assignment,
}: {
  assignment: Assignment;
}) {
  const { getStudentFromMembershipId, getMembershipFromWeekRecordId } =
    useCoaching();
  const { contextual, openContextual, setContextualRef } = useContextualMenu();
  return (
    <div className="cellWithContextual">
      <button
        type="button"
        onClick={() => openContextual(`assignment${assignment.recordId}`)}
      >
        {assignment.assignmentType}:{assignment.rating}
      </button>
      {contextual === `assignment${assignment.recordId}` && (
        <div
          className="contextualWrapper"
          key={`assignment${assignment.recordId}`}
        >
          <div className="contextual" ref={setContextualRef}>
            <ContextualControlls />
            <h4>
              {assignment.assignmentType} by{' '}
              {
                getStudentFromMembershipId(
                  getMembershipFromWeekRecordId(assignment.relatedWeek)
                    ?.recordId,
                )?.fullName
              }
            </h4>
            {/* Currently, .date does not exist on assignment */}
            {/* <p>{assignment.date}</p> */}

            <div className="lineWrapper">
              <p className="label">Corrected by: </p>
              <p className="content">{assignment.homeworkCorrector.name}</p>
            </div>

            <div className="lineWrapper">
              <p className="label">Rating: </p>
              <p className="content">{assignment.rating}</p>
            </div>
            <div className="lineWrapper">
              <p className="label">Notes: </p>
              <p className="content">{assignment.notes}</p>
            </div>
            <div className="lineWrapper">
              <p className="label">Areas of Difficulty: </p>
              <p className="content"> {assignment.areasOfDifficulty}</p>
            </div>
            {assignment.assignmentLink.length > 0 && (
              <>
                <div className="lineWrapper">
                  <h4>Session Documents:</h4>
                </div>
                <div className="lineWrapper">
                  {/* <p className="label">Assignment Link: </p> */}
                  <a target="_blank" href={assignment.assignmentLink}>
                    Assignment Link
                  </a>
                </div>
              </>
            )}
            {/* <div className="buttonBox">
              <button
                type="button"
                className="redButton"
                onClick={closeContextual}
              >
                Close
              </button>
            </div> */}
          </div>
        </div>
      )}
    </div>
  );
}
