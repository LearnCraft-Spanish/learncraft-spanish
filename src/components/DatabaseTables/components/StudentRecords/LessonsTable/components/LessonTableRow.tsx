import type { ReactNode } from 'react';
import type { Lesson } from 'src/types/CoachingTypes';
import pencilIcon from 'src/assets/icons/pencil.svg';
import { useContextualMenu } from 'src/hooks/useContextualMenu';

interface LessonTableRowProps {
  lesson: Lesson;
}

export default function LessonTableRow({
  lesson,
}: LessonTableRowProps): ReactNode {
  const { openContextual } = useContextualMenu();
  const { lessonName, recordId, weekRef, type } = lesson;

  return (
    <tr>
      <td
        className="edit-icon-cell"
        onClick={() => openContextual(`edit-lesson-${recordId}`)}
      >
        <div className="edit-icon-container">
          <img src={pencilIcon} alt="Edit" className="edit-icon" />
        </div>
      </td>
      <td style={{ whiteSpace: 'nowrap' }}>{lessonName}</td>
      <td>{weekRef}</td>
      <td>{type}</td>
    </tr>
  );
}
