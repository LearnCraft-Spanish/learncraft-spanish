import type { RecentRecords } from '@learncraft-spanish/shared';

type RecentAssignment = RecentRecords['assignments'][number];

export default function AssignmentRecordRow({
  assignment,
}: {
  assignment: RecentAssignment;
}) {
  return (
    <tr>
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
