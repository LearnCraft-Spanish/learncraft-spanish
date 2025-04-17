import { useState } from 'react';
import DisplayOnlyTable from 'src/components/CoachingDashboard/components/RecentRecords/DisplayOnlyTable';
import SectionHeader from 'src/components/CoachingDashboard/components/SectionHeader';
import useDropoutsByLevelReport from 'src/hooks/AdminData/useDropoutsByLevelReport';

function renderRow(row: any) {
  return (
    <tr>
      <td>{row['Course - Name']}</td>
      <td>{row['Number of Memberships']}</td>
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
