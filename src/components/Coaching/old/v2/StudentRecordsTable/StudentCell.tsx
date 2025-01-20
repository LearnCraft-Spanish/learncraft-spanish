import { useContextualMenu } from 'src/hooks/useContextualMenu';
import type { Week, Membership, Coach, Course } from '../CoachingTypes';

interface StudentCellProps {
  week: Week;
  memberships: { current: Membership[] };
  openStudentPopup: (recordId: number) => void;
  getStudentFromMembershipId: (membershipId: number) => any;
  getCourseFromMembershipId: (membershipId: number) => any;
  filterByCoach: Coach | undefined;
  filterByCourse: Course | undefined;
  filterByWeeksAgo: number;
}
export default function StudentCell({
  week,
  memberships,
  openStudentPopup,
  getStudentFromMembershipId,
  getCourseFromMembershipId,
  filterByCoach,
  filterByCourse,
  filterByWeeksAgo,
}: StudentCellProps) {
  const { contextual, closeContextual, setContextualRef } = useContextualMenu();
  const student = getStudentFromMembershipId(week.relatedMembership);
  console.log('student: ', student);
  if (!student) {
    return <div>no student found</div>;
  }
  const currentMemberships = memberships.current.filter(
    (membership) => membership.relatedStudent === student.recordId,
  );
  return (
    <div>
      <div
        className="studentBox"
        onClick={
          student.recordId ? () => openStudentPopup(student.recordId) : () => {}
        }
      >
        <strong>{student.fullName}</strong>
        <br />
        {student.email}
        <br />
        {filterByCoach &&
          (student.primaryCoach ? student.primaryCoach.name : 'No Coach')}
        {filterByCoach && <br />}
        {filterByCourse &&
          (getCourseFromMembershipId(week.relatedMembership)
            ? getCourseFromMembershipId(week.relatedMembership).name
            : 'No Course')}
        {!filterByCourse && <br />}
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
