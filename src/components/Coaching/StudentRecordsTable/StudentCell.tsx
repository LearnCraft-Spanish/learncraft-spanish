export default function StudentCell({ week }: { week: any }) {
  const student = getStudentFromMembershipId(week.relatedMembership);
  const currentMemberships = memberships.current.filter(
    (membership) => membership.relatedStudent === student.recordId,
  );
  return (
    <div>
      <div
        className="studentBox"
        onClick={
          student.recordId ? () => openStudentPopup(student.recordId) : null
        }
      >
        <strong>{student.fullName}</strong>
        <br />
        {student.email}
        <br />
        {!filterByCoach.recordId &&
          (student.primaryCoach ? student.primaryCoach.name : 'No Coach')}
        {!filterByCoach.recordId && <br />}
        {!filterByCourse.recordId &&
          (getCourseFromMembershipId(week.relatedMembership)
            ? getCourseFromMembershipId(week.relatedMembership).name
            : 'No Course')}
        {!filterByCourse.recordId && <br />}
        {filterByWeeksAgo < 0 && week.weekStarts}
      </div>
      {contextual === `student${student.recordId}` && student.recordId && (
        <div className="studentPopup" ref={setContextualRef}>
          <h4>{student.fullName}</h4>
          <p>
            Email:
            {student.email}
          </p>
          {student.primaryCoach.id && (
            <p>
              {' '}
              Primary Coach:
              {student.primaryCoach.name}
            </p>
          )}
          <h5>Active Memberships:</h5>
          {currentMemberships.map((membership) => (
            <p key={membership.recordId}>
              {getCourseFromMembershipId(membership.recordId).name} since{' '}
              {membership.startDate}
              {membership.onHold ? ', currently on Hold.' : '.'}
            </p>
          ))}
          {student.fluencyGoal.length > 1 && <h5>Fluency Goal:</h5>}
          {student.fluencyGoal.length > 1 && <p>{student.fluencyGoal}</p>}
          {student.startingLevel.length > 1 && <h5>Starting Level:</h5>}
          {student.startingLevel.length > 1 && <p>{student.startingLevel}</p>}
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
  );
}
