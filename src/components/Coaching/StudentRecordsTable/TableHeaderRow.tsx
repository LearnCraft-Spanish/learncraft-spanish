import type { Week } from '../CoachingTypes';

interface TableHeaderRowProps {
  weeksToDisplay: Week[];
  weekGetsPrivateCalls: (weekId: number) => boolean;
  weekGetsGroupCalls: (weekId: number) => boolean;
}
export default function TableHeaderRow({
  weeksToDisplay,
  weekGetsPrivateCalls,
  weekGetsGroupCalls,
}: TableHeaderRowProps) {
  return (
    <tr className="tableHeader">
      <th>Student</th>
      {weeksToDisplay.filter((item) => weekGetsPrivateCalls(item.recordId))
        .length > 0 && <th>Private Calls</th>}
      {weeksToDisplay.filter((item) => weekGetsGroupCalls(item.recordId))
        .length > 0 && <th>Group Calls</th>}
      <th>Assignments</th>
      <th>Notes</th>
      <th>Lesson</th>
    </tr>
  );
}
