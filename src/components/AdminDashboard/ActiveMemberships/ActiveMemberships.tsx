import type { MembershipReportData } from './types';
import { useState } from 'react';
import DisplayOnlyTable from 'src/components/CoachingDashboard/components/RecentRecords/DisplayOnlyTable';
import SectionHeader from 'src/components/CoachingDashboard/components/SectionHeader';
import useActiveMembershipsReport from 'src/hooks/AdminData/useActiveMembershipsReport';

function renderRow(data: MembershipReportData) {
  const { courseName, numberOfMemberships } = data;
  return (
    <tr key={courseName}>
      <td>{courseName}</td>
      <td>{numberOfMemberships}</td>
    </tr>
  );
}

export default function ActiveMemberships() {
  const { activeMembershipsReportQuery } = useActiveMembershipsReport();

  const [isOpen, setIsOpen] = useState(false);
  const headers = ['Course - Name', 'Number of Memberships'];

  return (
    <div>
      <SectionHeader
        title="Active Memberships"
        isOpen={isOpen}
        openFunction={() => setIsOpen(!isOpen)}
      />
      {isOpen && (
        <DisplayOnlyTable
          headers={headers}
          data={activeMembershipsReportQuery.data ?? []}
          renderRow={renderRow}
        />
      )}
    </div>
  );
}
