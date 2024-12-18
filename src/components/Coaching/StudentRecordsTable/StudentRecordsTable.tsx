import TableHeaderRow from './TableHeaderRow';
import TableRow from './TableRow';
import type { Week, Call, GroupSession } from '../CoachingTypes';

interface StudentRecordsTableProps {
  weeksToDisplay: Week[];
  weekGetsPrivateCalls: (weekId: number) => boolean;
  weekGetsGroupCalls: (weekId: number) => boolean;
}
export default function StudentRecordsTable({
  weeksToDisplay,
  weekGetsPrivateCalls,
  weekGetsGroupCalls,
}: StudentRecordsTableProps) {
  return (
    <table className="studentRecords">
      <thead>
        <TableHeaderRow
          weeksToDisplay={weeksToDisplay}
          weekGetsPrivateCalls={weekGetsPrivateCalls}
          weekGetsGroupCalls={weekGetsGroupCalls}
        />
      </thead>
      <tbody>
        <TableRow data={weeksToDisplay} />
      </tbody>
    </table>
  );
}
