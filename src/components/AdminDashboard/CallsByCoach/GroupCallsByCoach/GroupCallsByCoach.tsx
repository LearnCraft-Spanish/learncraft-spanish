import type { GroupCallData } from './types';
import DisplayOnlyTable from 'src/components/CoachingDashboard/components/RecentRecords/DisplayOnlyTable';
import SectionHeader from 'src/components/CoachingDashboard/components/SectionHeader';
import useGroupCallsByCoach from 'src/hooks/AdminData/useGroupCallsByCoach';

function renderRow(row: GroupCallData, onClickFunc?: (str: string) => void) {
  return (
    <tr key={row.coach}>
      <td
        onClick={() => {
          if (onClickFunc) {
            onClickFunc(`${row.coach}_Group Sessions per Coach`);
          }
        }}
      >
        {row.coach}
      </td>
      <td>{row.numberOfGroupSessions}</td>
    </tr>
  );
}

export default function GroupCallsByCoach({
  setSelectedReport,
  isOpen,
  setIsOpen,
}: {
  setSelectedReport: (report: string) => void;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}) {
  const { groupCallsByCoachQuery } = useGroupCallsByCoach();
  const headers = ['Coach', 'Number of Calls'];

  return (
    <div>
      <SectionHeader
        title="Group Calls by Coach"
        isOpen={isOpen}
        openFunction={() => setIsOpen(!isOpen)}
      />
      {isOpen && (
        <DisplayOnlyTable
          headers={headers}
          data={groupCallsByCoachQuery.data ?? []}
          renderRow={renderRow}
          onClickFunc={setSelectedReport}
        />
      )}
    </div>
  );
}
