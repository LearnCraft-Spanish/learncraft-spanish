import type { ReactNode } from 'react';
import type { QbQuiz } from 'src/types/DatabaseTables';
import pencilIcon from 'src/assets/icons/pencil.svg';
import { useContextualMenu } from 'src/hexagon/interface/hooks/useContextualMenu';

export default function QuizTableRow({ quiz }: { quiz: QbQuiz }): ReactNode {
  const { openContextual } = useContextualMenu();
  const { quizNickname, recordId, published } = quiz;

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
      <td style={{ whiteSpace: 'nowrap' }}>{published ? 'Yes' : 'No'}</td>
    </tr>
  );
}
