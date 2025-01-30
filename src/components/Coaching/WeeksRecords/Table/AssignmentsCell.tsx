import { useContextualMenu } from 'src/hooks/useContextualMenu';
import useCoaching from 'src/hooks/CoachingData/useCoaching';
import useAssignments from 'src/hooks/CoachingData/useAssignments';
import type { Assignment, Week } from 'src/types/CoachingTypes';
import ContextualControlls from 'src/components/ContextualControlls';
import { useUserData } from 'src/hooks/UserData/useUserData';
function AssignmentCell({ assignment }: { assignment: Assignment }) {
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

export default function AssignmentsCell({
  assignments,
  week,
}: {
  assignments: Assignment[] | null | undefined;
  week: Week;
}) {
  const { contextual, openContextual, setContextualRef, closeContextual } =
    useContextualMenu();
  const { createAssignmentMutation } = useAssignments();
  const userDataQuery = useUserData();

  function createNewAssignment() {
    createAssignmentMutation.mutate({
      relatedWeek: week.recordId,
      homeworkCorrector: userDataQuery.data?.emailAddress || 'no email',
      assignmentType: 'Pronunciation',
      rating: 'Excellent',
      notes: '',
      areasOfDifficulty: '',
      assignmentLink: '',
    });
  }

  return (
    <div className="assignmentsCell">
      {!!assignments &&
        assignments.map((assignment) => (
          <AssignmentCell
            assignment={assignment}
            key={`assignment${assignment.recordId}`}
          />
        ))}
      <button
        type="button"
        className="greenButton"
        onClick={() => openContextual(`addAssignment${week.recordId}`)}
      >
        Add Assignment
      </button>
      {contextual === `addAssignment${week.recordId}` && (
        <div
          className="contextualWrapper"
          key={`addAssignment${week.recordId}`}
        >
          <div className="contextual" ref={setContextualRef}>
            <ContextualControlls />
            <h4>Add Assignment for (student name)</h4>
            <div className="lineWrapper">
              <p className="label">Corrected By: </p>
              <p>will be active coach I assume</p>
              {/* <input type="text" / */}
            </div>
            <div className="lineWrapper">
              <p className="label">Assignment Type: </p>
              <input type="text" />
            </div>
            <div className="lineWrapper">
              <p className="label">Rating: </p>
              <input type="text" />
            </div>
            <div className="lineWrapper">
              <p className="label">Notes: </p>
              <input type="text" />
            </div>
            <div className="lineWrapper">
              <p className="label">Areas of Difficulty: </p>
              <input type="text" />
            </div>
            <div className="lineWrapper">
              <p className="label">Assignment Link: </p>
              <input type="text" />
            </div>
            <div className="buttonBox">
              <button
                type="button"
                className="redButton"
                onClick={closeContextual}
              >
                Cancel
              </button>
              <button
                type="button"
                className="greenButton"
                onClick={createNewAssignment}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
