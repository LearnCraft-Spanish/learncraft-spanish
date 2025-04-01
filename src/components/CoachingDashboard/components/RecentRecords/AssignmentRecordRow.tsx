import type { Assignment } from 'src/types/CoachingTypes';
import eye from 'src/assets/icons/eye.svg';
import { useContextualMenu } from 'src/hooks/useContextualMenu';

export default function AssignmentRecordRow({
  assignment,
}: {
  assignment: Assignment;
}) {
  const { openContextual } = useContextualMenu();
  return (
    <tr>
      <td className="viewRecordIconCell">
        <img
          src={eye}
          alt="view record"
          className="viewRecordIcon"
          onClick={() => {
            openContextual(`assignment-${assignment.recordId}`);
          }}
        />
      </td>
      <td>{assignment.assignmentName}</td>
      <td>{assignment.assignmentType}</td>
      {/* <td>{assignment.primaryCoach.name}</td> */}
      <td>{assignment.homeworkCorrector.name}</td>
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
      <td>{assignment.rating}</td>
      <td>{assignment.areasOfDifficulty}</td>
      <td>{assignment.notes}</td>
      <td>
        {typeof assignment.dateCreated === 'string'
          ? assignment.dateCreated
          : assignment.dateCreated.toLocaleDateString()}
      </td>
    </tr>
  );
}
