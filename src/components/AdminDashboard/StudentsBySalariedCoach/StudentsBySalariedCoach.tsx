import DeprecatedSectionHeader from '../DeprecatedSectionHeader';

/* Deprecated — re-enable when admin reports are migrated to hexagon.
import { useCallback, useEffect, useState } from 'react';
import CurrentStudentsDrilldownTable from './CurrentStudentsDrilldownTable';
import CurrentStudentsBySalariedCoach from './CurrentStuentsBySalariedCoach';
import StudentsBySalariedCoach2WeeksOut from './StudentsBySalariedCoach2WeeksOut';
import TwoWeeksOutDrilldownTable from './TwoWeeksOutDrilldownTable';

export default function StudentsBySalariedCoach() {
  const [selectedReport, setSelectedReport] = useState<string | null>(null);
  const [currentStudentsOpen, setCurrentStudentsOpen] = useState(false);
  const [twoWeeksOutOpen, setTwoWeeksOutOpen] = useState(false);

  const updateSelectedReport = useCallback((str: string) => {
    setSelectedReport(str);
  }, []);

  useEffect(() => {
    if (!currentStudentsOpen && !twoWeeksOutOpen) {
      setSelectedReport(null);
    }
  }, [currentStudentsOpen, twoWeeksOutOpen]);

  return (
    <div className="section-with-interactive-table">
      <div className="admin-dashboard-grid">
        <CurrentStudentsBySalariedCoach
          setSelectedReport={updateSelectedReport}
          isOpen={currentStudentsOpen}
          setIsOpen={setCurrentStudentsOpen}
        />
        <StudentsBySalariedCoach2WeeksOut
          setSelectedReport={updateSelectedReport}
          isOpen={twoWeeksOutOpen}
          setIsOpen={setTwoWeeksOutOpen}
        />
      </div>
      {selectedReport?.includes('Current Students') && (
        <CurrentStudentsDrilldownTable selectedReport={selectedReport} />
      )}
      {selectedReport?.includes('2 Weeks Out') && (
        <TwoWeeksOutDrilldownTable selectedReport={selectedReport} />
      )}
    </div>
  );
}
*/

export default function StudentsBySalariedCoach() {
  return (
    <div className="section-with-interactive-table">
      <div className="admin-dashboard-grid">
        <DeprecatedSectionHeader title="Current Students by Salaried Coach" />
        <DeprecatedSectionHeader title="Students by Salaried Coach - 2 Weeks Out" />
      </div>
    </div>
  );
}
