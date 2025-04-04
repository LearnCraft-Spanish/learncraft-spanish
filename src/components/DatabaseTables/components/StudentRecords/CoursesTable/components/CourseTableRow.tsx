import type { ReactNode } from 'react';
import type { Course } from 'src/types/CoachingTypes';
import pencilIcon from 'src/assets/icons/pencil.svg';
import { useContextualMenu } from 'src/hooks/useContextualMenu';

interface CourseTableRowProps {
  course: Course;
}

export default function CourseTableRow({ course }: CourseTableRowProps) {
  const { openContextual } = useContextualMenu();
  const {
    name,
    recordId,
    membershipType,
    approxMonthlyCost,
    weeklyPrivateCalls,
    hasGroupCalls,
    weeklyTimeCommitmentMinutes,
  } = course;

  return (
    <tr>
      <td
        className="edit-icon-cell"
        onClick={() => openContextual(`edit-course-${recordId}`)}
      >
        <div className="edit-icon-container">
          <img src={pencilIcon} alt="Edit" className="edit-icon" />
        </div>
      </td>
      <td style={{ whiteSpace: 'nowrap' }}>{name}</td>
      <td>{membershipType}</td>
      <td>${approxMonthlyCost}</td>
      <td>{weeklyPrivateCalls}</td>
      <td>{hasGroupCalls ? 'Yes' : 'No'}</td>
      <td>{weeklyTimeCommitmentMinutes}</td>
    </tr>
  );
}
