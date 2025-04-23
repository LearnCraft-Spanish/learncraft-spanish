import type { PrivateCall } from 'src/types/CoachingTypes';
import DisplayOnlyTable from 'src/components/CoachingDashboard/components/RecentRecords/DisplayOnlyTable';
import { InlineLoading } from 'src/components/Loading';
import useCallsDrilldownTable from './useCallsDrilldownTable';
import 'src/components/Table/Table.scss';

function renderRow(row: PrivateCall) {
  return (
    <tr key={row.recordId}>
      <td>{row.weekName}</td>
      <td>{row.rating}</td>
      <td>{row.areasOfDifficulty}</td>
      <td>{row.notes}</td>
      <td>
        {row.recording && (
          <a
            className="content"
            href={row.recording}
            target="_blank"
            rel="noreferrer"
          >
            Recording
          </a>
        )}
      </td>
      <td>{row.caller.name}</td>
      <td>
        {typeof row.date === 'string'
          ? row.date
          : row.date.toLocaleDateString()}
      </td>
      <td>{row.callType}</td>
    </tr>
  );
}

export default function DrilldownTable({
  selectedReport,
}: {
  selectedReport: string;
}) {
  // const { contextual } = useContextualMenu();
  const coachId = selectedReport.split('_')[0];
  const report = selectedReport.split('_')[1];

  if (!coachId || !report) {
    throw new Error('Coach ID or report not found');
  }

  const { data, isLoading, isError, isSuccess } = useCallsDrilldownTable(
    coachId,
    report,
  );

  return (
    <div className="table-wrapper body-container">
      {isLoading && <InlineLoading />}
      {isError && <div>Error</div>}
      {isSuccess && data && (
        <DisplayOnlyTable
          headers={[
            'Week',
            'Rating',
            'Areas of Difficulty',
            'Notes',
            'Recording',
            'Caller',
            'Date',
            'Call Type',
          ]}
          data={data}
          renderRow={renderRow}
        />
      )}
    </div>
  );
}
