import type { GroupSessionWithAttendees } from 'src/types/CoachingTypes';
import DisplayOnlyTable from 'src/components/CoachingDashboard/components/RecentRecords/DisplayOnlyTable';
import { InlineLoading } from 'src/components/Loading';
import useCallsDrilldownTable from './useCallsDrilldownTable';
import 'src/components/Table/Table.scss';

function renderRow(row: GroupSessionWithAttendees) {
  return (
    <tr key={row.recordId}>
      <td>{row.coach.name}</td>
      <td>
        {typeof row.date === 'string'
          ? row.date
          : row.date.toLocaleDateString()}
      </td>
      <td>{row.topic}</td>
      <td>{row.comments}</td>
      <td>
        {row.zoomLink && (
          <a
            className="content"
            href={row.zoomLink}
            target="_blank"
            rel="noreferrer"
          >
            Recording
          </a>
        )}
      </td>
      <td>
        {row.callDocument && (
          <a
            className="content"
            href={row.callDocument}
            target="_blank"
            rel="noreferrer"
          >
            Call Document
          </a>
        )}
      </td>
      <td>{row.sessionType}</td>
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
            'Coach',
            'Date',
            'Topic',
            'Comments',
            'Zoom Link',
            'Call Document',
            'Session Type',
          ]}
          data={data}
          renderRow={renderRow}
        />
      )}
    </div>
  );
}
