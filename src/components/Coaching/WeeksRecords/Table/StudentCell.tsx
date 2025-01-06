import type { Week } from './../../CoachingTypes';
import useCoaching from '../../../../hooks/useCoaching';
import eye from '../../../../resources/icons/eye.svg';
import pencil from '../../../../resources/icons/pencil.svg';
import { useContextualMenu } from '../../../../hooks/useContextualMenu';
import ViewWeekRecord from '../ViewWeekRecord';
import { useMemo } from 'react';
export default function StudentCell({ week }: { week: Week }) {
  const { getStudentFromMembershipId } = useCoaching();
  const student = getStudentFromMembershipId(week.relatedMembership);

  if (!student) return null;

  const { contextual, openContextual } = useContextualMenu();

  return (
    <div className="studentCell">
      <div className="studentCellControlls">
        <img
          src={eye}
          alt="view record"
          className="icon"
          onClick={() => openContextual(`week${week.recordId}`)}
        />
        {/* <img src={pencil} alt="edit record" className="icon" /> */}
      </div>
      <div className="content">
        <h4>{student.fullName}</h4>
        <p>{student?.email}</p>
        <p>{student?.primaryCoach.name}</p>
        <p>{week.level}</p>
      </div>
    </div>
  );
}
