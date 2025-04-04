import pencilIcon from 'src/assets/icons/pencil.svg';
import { useContextualMenu } from 'src/hooks/useContextualMenu';
import type { Student } from '../types';
import { ReactNode } from 'react';

export default function StudentTableRow({
  student,
  program,
}: {
  student: Student;
  program: string;
}): ReactNode {
  const { openContextual } = useContextualMenu();
  const { name, emailAddress, cohort, role, recordId } = student;

  return (
    <tr>
      <td
        className="edit-icon-cell"
        onClick={() => openContextual(`edit-student-${recordId}`)}
      >
        <div className="edit-icon-container">
          <img src={pencilIcon} alt="Edit" className="edit-icon" />
        </div>
      </td>
      <td>{name}</td>
      <td>{emailAddress}</td>
      <td>{program}</td>
      <td>{cohort}</td>
      <td>{role}</td>
    </tr>
  );
}
