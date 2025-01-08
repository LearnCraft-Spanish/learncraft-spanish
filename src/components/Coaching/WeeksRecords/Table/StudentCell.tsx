import type { Week } from '../../../../types/CoachingTypes';
import useCoaching from '../../../../hooks/useCoaching';
import eye from '../../../../assets/icons/eye.svg';
// import pencil from '../../../../assets/icons/pencil.svg';
import { useContextualMenu } from '../../../../hooks/useContextualMenu';

export default function StudentCell({ week }: { week: Week }) {
  const { getStudentFromMembershipId } = useCoaching();
  const { contextual, openContextual } = useContextualMenu();

  const student = getStudentFromMembershipId(week.relatedMembership);

  return (
    student && (
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
          <p>{student.email}</p>
          <p>{student.primaryCoach.name}</p>
          <p>{week.level}</p>
        </div>
      </div>
    )
  );
}
