import type { RecentRecords } from '@learncraft-spanish/shared';
import { useContextualMenu } from '@interface/hooks/useContextualMenu';
import eye from 'src/assets/icons/eye.svg';

type RecentAssignment = RecentRecords['assignments'][number];

export default function AssignmentRecordRow({
  assignment,
}: {
  assignment: RecentAssignment;
}): React.JSX.Element {
  const { openContextual } = useContextualMenu();

  return (
    <tr>
      <td className="viewRecordIconCell">
        <button
          type="button"
          className="viewRecordIconButton"
          onClick={() => openContextual(`assignment${assignment.assignmentId}`)}
        >
          <img src={eye} alt="view assignment" className="viewRecordIcon" />
        </button>
      </td>
      <td>{assignment.weekId}</td>
      <td>{assignment.assignmentType.assignmentType}</td>
      <td>{assignment.homeworkCorrector.fullName}</td>
      <td>
        {assignment.assignmentLink && (
          <a
            className="content"
            href={assignment.assignmentLink}
            target="_blank"
            rel="noreferrer"
          >
            Assignment Link
          </a>
        )}
      </td>
      <td>{assignment.assignmentRating.assignmentRating}</td>
      <td>{assignment.areasOfDifficulty}</td>
      <td>{assignment.notes}</td>
    </tr>
  );
}
