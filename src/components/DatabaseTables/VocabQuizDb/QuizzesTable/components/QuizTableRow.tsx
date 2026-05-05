import type { AdminQuizRecord } from '@learncraft-spanish/shared';
import type { ReactNode } from 'react';
import pencilIcon from 'src/assets/icons/pencil.svg';
import { useContextualMenu } from 'src/hexagon/interface/hooks/useContextualMenu';

export default function QuizTableRow({
  quiz,
}: {
  quiz: AdminQuizRecord;
}): ReactNode {
  const { openContextual } = useContextualMenu();
  const { quizNickname, id, published } = quiz;

  return (
    <tr>
      <td
        className="edit-icon-cell"
        onClick={() => openContextual(`edit-quiz-${id}`)}
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
