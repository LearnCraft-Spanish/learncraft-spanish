import type { ReactNode } from 'react';
import type { Program } from 'src/types/interfaceDefinitions';
import pencilIcon from 'src/assets/icons/pencil.svg';
import { useContextualMenu } from 'src/hooks/useContextualMenu';

interface ProgramTableRowProps {
  program: Program;
}

export default function ProgramTableRow({
  program,
}: ProgramTableRowProps): ReactNode {
  const { openContextual } = useContextualMenu();
  const { name, recordId } = program;

  return (
    <tr>
      <td
        className="edit-icon-cell"
        onClick={() => openContextual(`edit-program-${recordId}`)}
      >
        <div className="edit-icon-container">
          <img src={pencilIcon} alt="Edit" className="edit-icon" />
        </div>
      </td>
      <td style={{ whiteSpace: 'nowrap' }}>{name}</td>
      {/* <td>{program.lessons.length}</td> */}
      <td>{program.cohortACurrentLesson}</td>
      <td>{program.cohortBCurrentLesson}</td>
      <td>{program.cohortCCurrentLesson}</td>
      <td>{program.cohortDCurrentLesson}</td>
      <td>{program.cohortECurrentLesson}</td>
      <td>{program.cohortFCurrentLesson}</td>
      <td>{program.cohortGCurrentLesson}</td>
      <td>{program.cohortHCurrentLesson}</td>
      <td>{program.cohortICurrentLesson}</td>
      <td>{program.cohortJCurrentLesson}</td>
    </tr>
  );
}
