import type { MembershipReportData } from '../ActiveMemberships/types';
import { useState } from 'react';
import DisplayOnlyTable from 'src/components/CoachingDashboard/components/RecentRecords/DisplayOnlyTable';
import SectionHeader from 'src/components/CoachingDashboard/components/SectionHeader';
import useDropoutsByLevelReport from 'src/hooks/AdminData/useDropoutsByLevelReport';

function renderRow(row: MembershipReportData) {
  return (
    <tr key={row.courseName}>
      <td>{row.courseName}</td>
      <td>{row.numberOfMemberships}</td>
    </tr>
  );
}

export default function DropoutsByLevel() {
  const { dropoutsByLevelReportQuery } = useDropoutsByLevelReport();

  const [isOpen, setIsOpen] = useState(false);
  const headers = ['Course - Name', 'Number of Memberships'];

  return (
    <div>
      <SectionHeader
        title="Dropouts By Level"
        isOpen={isOpen}
        openFunction={() => setIsOpen(!isOpen)}
      />
      {isOpen && (
        <DisplayOnlyTable
          headers={headers}
          data={dropoutsByLevelReportQuery.data ?? []}
          renderRow={renderRow}
        />
      )}
    </div>
  );
}
