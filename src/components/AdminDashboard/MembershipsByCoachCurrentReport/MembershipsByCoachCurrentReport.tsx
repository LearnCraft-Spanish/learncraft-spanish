import { useCallback, useEffect, useState } from 'react';
import MembershipsByCoachCurrentReportDrilldownTable from './MembershipsByCoachCurrentReportDrilldownTable';
import MembershipsByCoachCurrentReportTable from './MembershipsByCoachCurrentReportTable';

export default function MembershipsByCoachCurrentReport() {
  const [selectedReport, setSelectedReport] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  const updateSelectedReport = useCallback((str: string) => {
    setSelectedReport(str);
  }, []);

  useEffect(() => {
    if (!isOpen) {
      setSelectedReport(null);
    }
  }, [isOpen]);

  return (
    <div className="section-with-interactive-table">
      <MembershipsByCoachCurrentReportTable
        setSelectedReport={updateSelectedReport}
        isOpen={isOpen}
        setIsOpen={setIsOpen}
      />
      {selectedReport?.includes('Current') && (
        <MembershipsByCoachCurrentReportDrilldownTable
          selectedReport={selectedReport}
        />
      )}
    </div>
  );
}
