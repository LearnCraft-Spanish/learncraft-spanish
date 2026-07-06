import { useCallback, useEffect, useState } from 'react';
import MembershipsByCoachCurrentReportDrilldownTable from './MembershipsByCoachCurrentReportDrilldownTable';
import MembershipsByCoachCurrentReportTable from './MembershipsByCoachCurrentReportTable';
import MembershipsByCoachTwoWeeksOutReportDrilldownTable from './MembershipsByCoachTwoWeeksOutReportDrilldownTable';
import MembershipsByCoachTwoWeeksOutReportTable from './MembershipsByCoachTwoWeeksOutReportTable';

export default function MembershipsByCoachReports() {
  const [selectedReport, setSelectedReport] = useState<string | null>(null);
  const [currentReportOpen, setCurrentReportOpen] = useState(false);
  const [twoWeeksOutReportOpen, setTwoWeeksOutReportOpen] = useState(false);

  const updateSelectedReport = useCallback((str: string) => {
    setSelectedReport(str);
  }, []);

  useEffect(() => {
    if (!currentReportOpen && !twoWeeksOutReportOpen) {
      setSelectedReport(null);
    }
  }, [currentReportOpen, twoWeeksOutReportOpen]);

  return (
    <div className="section-with-interactive-table">
      <div className="admin-dashboard-grid">
        <MembershipsByCoachCurrentReportTable
          setSelectedReport={updateSelectedReport}
          isOpen={currentReportOpen}
          setIsOpen={setCurrentReportOpen}
        />
        <MembershipsByCoachTwoWeeksOutReportTable
          setSelectedReport={updateSelectedReport}
          isOpen={twoWeeksOutReportOpen}
          setIsOpen={setTwoWeeksOutReportOpen}
        />
      </div>
      {selectedReport?.includes('Current') && (
        <MembershipsByCoachCurrentReportDrilldownTable
          selectedReport={selectedReport}
        />
      )}
      {selectedReport?.includes('2 Weeks Out') && (
        <MembershipsByCoachTwoWeeksOutReportDrilldownTable
          selectedReport={selectedReport}
        />
      )}
    </div>
  );
}
