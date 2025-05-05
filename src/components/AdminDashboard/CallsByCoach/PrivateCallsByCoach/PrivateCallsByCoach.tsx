import type { PrivateCallData } from './types';
import DisplayOnlyTable from 'src/components/CoachingDashboard/components/RecentRecords/DisplayOnlyTable';
import SectionHeader from 'src/components/CoachingDashboard/components/SectionHeader';
import usePrivateCallsByCoach from 'src/hooks/AdminData/usePrivateCallsByCoach';

function renderRow(row: PrivateCallData, onClickFunc?: (str: string) => void) {
  return (
    <tr key={row.caller}>
      <td
        onClick={() => {
          if (onClickFunc) {
            onClickFunc(`${row.caller}_Calls per Coach`);
          }
        }}
      >
        {row.caller}
      </td>
      <td>{row.numberOfCalls}</td>
    </tr>
  );
}

export default function PrivateCallsByCoach({
  setSelectedReport,
  isOpen,
  setIsOpen,
}: {
  setSelectedReport: (report: string) => void;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}) {
  const { privateCallsByCoachQuery } = usePrivateCallsByCoach();
  const headers = ['Coach', 'Number of Calls'];

  return (
    <div>
      <SectionHeader
        title="Private Calls by Coach"
        isOpen={isOpen}
        openFunction={() => setIsOpen(!isOpen)}
      />
      {isOpen && (
        <DisplayOnlyTable
          headers={headers}
          data={privateCallsByCoachQuery.data ?? []}
          renderRow={renderRow}
          onClickFunc={setSelectedReport}
        />
      )}
    </div>
  );
}
