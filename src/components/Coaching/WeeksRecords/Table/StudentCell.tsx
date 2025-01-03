import type { Week } from './../../CoachingTypes';
import useCoaching from '../../../../hooks/useCoaching';
import eye from '../../../../resources/icons/eye.svg';
import pencil from '../../../../resources/icons/pencil.svg';
import { useContextualMenu } from '../../../../hooks/useContextualMenu';
import ViewWeekRecord from '../ViewWeekRecord';
export default function StudentCell({ week }: { week: Week }) {
  const { getStudentFromMembershipId } = useCoaching();
  const student = getStudentFromMembershipId(week.relatedMembership);

  const { contextual, openContextual } = useContextualMenu();

  if (!student) return null;
  return (
    <div className="studentCell">
      <div className="controlls">
        <img
          src={eye}
          alt="view record"
          className="icon"
          onClick={() => openContextual(`week${week.recordId}`)}
        />
        <img src={pencil} alt="edit record" className="icon" />
      </div>
      <div className="content">
        <h4> {student.fullName}</h4>
        <p>{student?.email}</p>
        <p>{student?.primaryCoach.name}</p>
        <p>{week.level}</p>
      </div>
      {/* {contextual === `week${week.recordId}` && <ViewWeekRecord week={week} />} */}
    </div>
  );
}
