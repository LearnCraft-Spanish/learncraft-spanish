import type { ReactNode } from 'react';
import type { FlashcardStudent } from 'src/types/interfaceDefinitions';
import pencilIcon from 'src/assets/icons/pencil.svg';
import { useContextualMenu } from 'src/hooks/useContextualMenu';
export default function StudentTableRow(student: FlashcardStudent): ReactNode {
  const { openContextual } = useContextualMenu();
  const { name, emailAddress, cohort, role, recordId } = student;

  return (
    <tr>
      <td className="edit-icon-cell">
        <div
          onClick={() => openContextual(`edit-student-${recordId}`)}
          className="edit-icon-container"
        >
          <img src={pencilIcon} alt="Edit" className="edit-icon" />
        </div>
      </td>
      <td>{name}</td>
      <td>{emailAddress}</td>
      <td>{cohort}</td>
      <td>{role}</td>
    </tr>
  );
}
