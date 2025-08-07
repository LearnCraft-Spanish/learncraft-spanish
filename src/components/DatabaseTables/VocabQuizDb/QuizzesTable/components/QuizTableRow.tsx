import type { ReactNode } from 'react';
import type { Quiz } from 'src/types/interfaceDefinitions';
import pencilIcon from 'src/assets/icons/pencil.svg';
import { useContextualMenu } from 'src/hexagon/interface/hooks/useContextualMenu';

export default function QuizTableRow({ quiz }: { quiz: Quiz }): ReactNode {
  const { openContextual } = useContextualMenu();
  const { quizNickname, recordId } = quiz;

  return (
    <tr>
      <td
        className="edit-icon-cell"
        onClick={() => openContextual(`edit-quiz-${recordId}`)}
      >
        <div className="edit-icon-container">
          <img src={pencilIcon} alt="Edit" className="edit-icon" />
        </div>
      </td>
      <td style={{ whiteSpace: 'nowrap' }}>{quizNickname}</td>
    </tr>
  );
}
