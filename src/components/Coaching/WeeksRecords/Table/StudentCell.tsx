import { useContextualMenu } from 'src/hooks/useContextualMenu';
import type { Student, Week } from 'src/types/CoachingTypes';
import eye from 'src/assets/icons/eye.svg';
// import pencil from 'src/resources/icons/pencil.svg';

export default function StudentCell({
  week,
  student,
}: {
  week: Week;
  student: Student | null | undefined;
}) {
  const { openContextual } = useContextualMenu();

  if (!student) {
    return null;
  }

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
