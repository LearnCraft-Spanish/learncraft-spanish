import { useState } from 'react';
import DisplayOnlyTable from 'src/components/CoachingDashboard/components/RecentRecords/DisplayOnlyTable';
import SectionHeader from 'src/components/CoachingDashboard/components/SectionHeader';
import useActiveMembershipsReport from 'src/hooks/AdminData/useActiveMembershipsReport';

export default function ActiveMemberships() {
  const { data, isLoading, error } = useActiveMembershipsReport();

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
        <div className="active-memberships-table">
          <DisplayOnlyTable
            headers={headers}
            data={data ?? []}
            renderRow={renderRow}
          />
        </div>
      )}
    </div>
  );
}

function renderRow(row: any) {
  return (
    <tr>
      <td>{row['Course - Name']}</td>
      <td>{row['Number of Memberships']}</td>
    </tr>
  );
}
