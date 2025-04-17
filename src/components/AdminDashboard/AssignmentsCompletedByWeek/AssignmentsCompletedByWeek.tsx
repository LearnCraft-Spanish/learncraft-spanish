import { useState } from 'react';
import DisplayOnlyTable from 'src/components/CoachingDashboard/components/RecentRecords/DisplayOnlyTable';
import SectionHeader from 'src/components/CoachingDashboard/components/SectionHeader';
import ContextualView from 'src/components/Contextual/ContextualView';
import useAssignmentsCompletedByWeek from 'src/hooks/AdminData/useAssignmentsCompletedByWeek';
function renderRow(row: any) {
  return (
    <tr>
      <td>{row.Level}</td>
      <td>{row['Assignments Completed (avg)']}</td>
    </tr>
  );
}
export default function AssignmentsCompletedByWeek() {
  const { data, isLoading, error } = useAssignmentsCompletedByWeek();

  const [isOpen, setIsOpen] = useState(false);
  const headers = ['Level', 'Assignments Completed (avg)'];

  return (
    <div>
      <SectionHeader
        title="Assignments Completed By Week"
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

/*
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
  const { data, isLoading, error } = useDropoutsByLevelReport();

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

*/
