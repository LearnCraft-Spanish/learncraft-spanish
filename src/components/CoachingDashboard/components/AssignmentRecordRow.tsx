import type { Assignment } from 'src/types/CoachingTypes';

export default function AssignmentRecordRow({
  assignment,
}: {
  assignment: Assignment;
}) {
  return (
    <tr>
      <td>{assignment.assignmentName}</td>
      <td>{assignment.assignmentType}</td>
      {/* <td>{assignment.primaryCoach.name}</td> */}
      <td>{assignment.homeworkCorrector.name}</td>
      <td>{assignment.assignmentLink}</td>
      <td>{assignment.rating}</td>
      <td>{assignment.areasOfDifficulty}</td>
      <td>{assignment.notes}</td>
      <td>{assignment.dateCreated}</td>
    </tr>
  );
}
