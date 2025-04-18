import { useEffect, useState } from 'react';
import DrilldownTable from './DrilldownTable';
import LastWeekCoachSummary from './LastWeekCoachSummary';
import WeekCoachSummary from './WeekCoachSummary';

export default function WeeklySummaries() {
  const [selectedReport, setSelectedReport] = useState<string | null>(null);
  const [weekCoachSummaryOpen, setWeekCoachSummaryOpen] = useState(false);
  const [lastWeekCoachSummaryOpen, setLastWeekCoachSummaryOpen] =
    useState(false);

  const updateSelectedReport = (str: string) => {
    setSelectedReport(str);
  };

  useEffect(() => {
    if (!weekCoachSummaryOpen && !lastWeekCoachSummaryOpen) {
      setSelectedReport(null);
    }
  }, [weekCoachSummaryOpen, lastWeekCoachSummaryOpen]);

  return (
    <div>
      <div className="admin-dashboard-grid">
        <WeekCoachSummary
          setSelectedReport={updateSelectedReport}
          isOpen={weekCoachSummaryOpen}
          setIsOpen={setWeekCoachSummaryOpen}
        />
        <LastWeekCoachSummary
          setSelectedReport={updateSelectedReport}
          isOpen={lastWeekCoachSummaryOpen}
          setIsOpen={setLastWeekCoachSummaryOpen}
        />
      </div>
      {selectedReport && <DrilldownTable selectedReport={selectedReport} />}
    </div>
  );
}
