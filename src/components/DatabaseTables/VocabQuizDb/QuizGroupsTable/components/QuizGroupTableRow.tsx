import type { AdminQuizGroup } from '@learncraft-spanish/shared';
import type { ReactNode } from 'react';
import pencilIcon from 'src/assets/icons/pencil.svg';
import { useContextualMenu } from 'src/hexagon/interface/hooks/useContextualMenu';

export default function QuizGroupTableRow({
  quizGroup,
}: {
  quizGroup: AdminQuizGroup;
}): ReactNode {
  const { openContextual } = useContextualMenu();
  const { id, name, urlSlug, published, courseId, courseName } = quizGroup;

  return (
    <tr>
      <td
        className="edit-icon-cell"
        onClick={() => openContextual(`edit-quiz-group-${id}`)}
      >
        <div className="edit-icon-container">
          <img src={pencilIcon} alt="Edit" className="edit-icon" />
        </div>
      </td>
      <td style={{ whiteSpace: 'nowrap' }}>{id}</td>
      <td style={{ whiteSpace: 'nowrap' }}>{name}</td>
      <td style={{ whiteSpace: 'nowrap' }}>{urlSlug}</td>
      <td style={{ whiteSpace: 'nowrap' }}>{published ? 'Yes' : 'No'}</td>
      <td style={{ whiteSpace: 'nowrap' }}>{courseId}</td>
      <td style={{ whiteSpace: 'nowrap' }}>{courseName}</td>
    </tr>
  );
}
