import type { Assignment, Week } from './CoachingTypes';
import { useContextualMenu } from '../../hooks/useContextualMenu';
import useCoaching from '../../hooks/useCoaching';
import { useEffect, useState } from 'react';

export default function NewAssignmentCell({
  assignment,
}: {
  assignment: Assignment;
}) {
  console.log('in new assignment cell!');
  const { getStudentFromMembershipId, getMembershipFromWeekId } = useCoaching();
  const { contextual, closeContextual, openContextual, setContextualRef } =
    useContextualMenu();
  return (
    <div className="assignmentBox" key={assignment.recordId}>
      <button
        type="button"
        onClick={() => openContextual(`assignment${assignment.recordId}`)}
      >
        {assignment.assignmentType}:{assignment.rating}
      </button>
      {contextual === `assignment${assignment.recordId}` && (
        <div className="contextualWrapper">
          <div className="contextual assignmentPopup" ref={setContextualRef}>
            <h4>
              {assignment.assignmentType} by{' '}
              {
                getStudentFromMembershipId(
                  getMembershipFromWeekId(assignment.relatedWeek)?.recordId,
                )?.fullName
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
        </div>
      )}
    </div>
  );
}
