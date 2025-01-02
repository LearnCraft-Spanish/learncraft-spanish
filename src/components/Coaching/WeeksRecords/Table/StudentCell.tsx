import type { Week } from './../../CoachingTypes';
import useCoaching from '../../../../hooks/useCoaching';
export default function StudentCell({ week }: { week: Week }) {
  const { getStudentFromMembershipId } = useCoaching();
  const student = getStudentFromMembershipId(week.relatedMembership);

  if (!student) return null;
  return (
    <div className="studentCell">
      <h4> {student.fullName}</h4>
      <p>{student?.email}</p>
      <p>{student?.primaryCoach.name}</p>
      <p>{week.level}</p>
    </div>
  );
}
