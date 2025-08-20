import type { Student, Week } from 'src/types/CoachingTypes';
import eye from 'src/assets/icons/eye.svg';
import { useContextualMenu } from 'src/hexagon/interface/hooks/useContextualMenu';
// import pencil from 'src/resources/icons/pencil.svg';

export default function StudentCell({
  week,
  student,
  hiddenFields,
}: {
  week: Week;
  student: Student | null | undefined;
  hiddenFields: string[];
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
          {!hiddenFields.includes('primaryCoach') && (
            <p>
              {student.primaryCoach
                ? student.primaryCoach.name
                : 'No Coach Found'}
            </p>
          )}
          {!hiddenFields.includes('level') && <p>{week.level}</p>}
        </div>
      </div>
    )
  );
}
