import TableHeaderRow from './TableHeaderRow';
import TableRow from './TableRow';

export default function StudentRecordsTable({
  weeksToDisplay,
  weekGetsPrivateCalls,
  weekGetsGroupCalls,
}) {
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
