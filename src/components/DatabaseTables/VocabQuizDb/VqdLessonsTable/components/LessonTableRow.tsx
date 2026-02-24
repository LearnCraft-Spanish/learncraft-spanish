import type { ReactNode } from 'react';
import type { Lesson } from 'src/types/DatabaseTables';
import pencilIcon from 'src/assets/icons/pencil.svg';
import { useContextualMenu } from 'src/hexagon/interface/hooks/useContextualMenu';

export default function LessonTableRow({
  lesson,
}: {
  lesson: Lesson;
}): ReactNode {
  const { openContextual } = useContextualMenu();
  const {
    recordId,
    lesson: lessonName,
    lessonNumber,
    subtitle,
    published,
    relatedProgram,
    programName,
  } = lesson;

  return (
    <tr>
      <td
        className="edit-icon-cell"
        onClick={() => openContextual(`edit-vqd-lesson-${recordId}`)}
      >
        <div className="edit-icon-container">
          <img src={pencilIcon} alt="Edit" className="edit-icon" />
        </div>
      </td>
      <td style={{ whiteSpace: 'nowrap' }}>{recordId}</td>
      <td style={{ whiteSpace: 'nowrap' }}>{lessonName}</td>
      <td style={{ whiteSpace: 'nowrap' }}>{lessonNumber}</td>
      <td style={{ whiteSpace: 'nowrap' }}>{subtitle}</td>
      <td style={{ whiteSpace: 'nowrap' }}>{published ? 'Yes' : 'No'}</td>
      <td style={{ whiteSpace: 'nowrap' }}>{relatedProgram}</td>
      <td style={{ whiteSpace: 'nowrap' }}>{programName}</td>
    </tr>
  );
}
