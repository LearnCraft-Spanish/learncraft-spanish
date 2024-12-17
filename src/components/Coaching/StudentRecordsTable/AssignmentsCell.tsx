export default function AssignmentsCell({ data }: { data: any[] }) {
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
            <p>{assignment.date}</p>
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
