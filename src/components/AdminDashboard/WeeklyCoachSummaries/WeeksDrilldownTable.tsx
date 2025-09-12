import { InlineLoading } from '@interface/components/Loading';
import checkmark from 'src/assets/icons/checkmark_green.svg';
import AssignmentsCell from 'src/components/StudentDrillDown/components/general/AssignmentsCell_Modificed';
import GroupSessionsCell from 'src/components/StudentDrillDown/components/general/GroupSessionsCell_Modified';
import PrivateCallsCell from 'src/components/StudentDrillDown/components/general/PrivateCallsCell_Modificed';
import { toISODate } from 'src/functions/dateUtils';
import useWeeksDrilldownTable from './useWeeksDrilldownTable';
import 'src/components/Table/Table.scss';

const headers = [
  'Student',
  'Level',
  'Primary Coach',
  'Week Start',
  'Assignments',
  'Private Calls',
  'Group Calls',
  'Current Lesson',
  'Notes',
  'Hold Week',
  'Records Complete',
];
export default function DrilldownTable({
  selectedReport,
}: {
  selectedReport: string;
}) {
  const coachId = selectedReport.split('_')[0];
  const report = selectedReport.split('_')[1];

  if (!coachId || !report) {
    throw new Error('Coach ID or report not found');
  }

  const { data, isLoading, isError, isSuccess } = useWeeksDrilldownTable(
    coachId,
    report,
  );
  return (
    <div className="table-wrapper body-container">
      {isLoading && <InlineLoading />}
      {isError && <div>Error</div>}
      {isSuccess && data && (
        <table>
          <thead>
            <tr>
              {headers.map((header) => (
                <th key={header}>{header}</th>
              ))}
            </tr>
          </thead>
          <tbody className="weeks-list">
            {data.map((week) => (
              <tr key={week.recordId}>
                <td>{week.student}</td>
                <td>{week.level}</td>
                <td>{week.primaryCoach.name}</td>
                <td>{toISODate(new Date(week.weekStarts))}</td>
                <td>
                  {week.assignments.length > 0 && (
                    <AssignmentsCell assignments={week.assignments} />
                  )}
                </td>

                <td>
                  {week.privateCalls.length > 0 && (
                    <PrivateCallsCell
                      calls={week.privateCalls}
                      studentName={week.student}
                    />
                  )}
                </td>
                <td>
                  {week.groupCalls.length > 0 && (
                    <GroupSessionsCell groupSessions={week.groupCalls} />
                  )}
                </td>
                <td>{week.currentLessonName}</td>
                <td>{week.notes}</td>
                <td>
                  {week.holdWeek && <img src={checkmark} alt="checkmark" />}
                </td>
                <td>
                  {week.recordsComplete && (
                    <img
                      className="checkmark"
                      src={checkmark}
                      alt="checkmark"
                    />
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
