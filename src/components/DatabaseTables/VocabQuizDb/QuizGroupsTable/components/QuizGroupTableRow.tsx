import type { ReactNode } from 'react';
import type { QuizGroup } from 'src/types/DatabaseTables';
import pencilIcon from 'src/assets/icons/pencil.svg';
import { useContextualMenu } from 'src/hexagon/interface/hooks/useContextualMenu';

export default function QuizGroupTableRow({
  quizGroup,
}: {
  quizGroup: QuizGroup;
}): ReactNode {
  const { openContextual } = useContextualMenu();
  const { recordId, name, urlSlug, published, relatedProgram, programName } =
    quizGroup;

  return (
    <tr>
      <td
        className="edit-icon-cell"
        onClick={() => openContextual(`edit-quiz-group-${recordId}`)}
      >
        <div className="edit-icon-container">
          <img src={pencilIcon} alt="Edit" className="edit-icon" />
        </div>
      </td>
      <td style={{ whiteSpace: 'nowrap' }}>{recordId}</td>
      <td style={{ whiteSpace: 'nowrap' }}>{name}</td>
      <td style={{ whiteSpace: 'nowrap' }}>{urlSlug}</td>
      <td style={{ whiteSpace: 'nowrap' }}>{published ? 'Yes' : 'No'}</td>
      <td style={{ whiteSpace: 'nowrap' }}>{relatedProgram}</td>
      <td style={{ whiteSpace: 'nowrap' }}>{programName}</td>
    </tr>
  );
}
