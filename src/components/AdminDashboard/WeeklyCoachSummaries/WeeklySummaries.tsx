import DeprecatedSectionHeader from '../DeprecatedSectionHeader';

/* Deprecated — re-enable when admin reports are migrated to hexagon.
import { useEffect, useState } from 'react';
import LastWeekCoachSummary from './LastWeekCoachSummary';
import WeekCoachSummary from './WeekCoachSummary';
import WeeksDrilldownTable from './WeeksDrilldownTable';

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
    <div className="section-with-interactive-table">
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
      {selectedReport && (
        <WeeksDrilldownTable selectedReport={selectedReport} />
      )}
    </div>
  );
}
*/

export default function WeeklySummaries() {
  return (
    <div className="section-with-interactive-table">
      <div className="admin-dashboard-grid">
        <DeprecatedSectionHeader title="Week Coach Summary" />
        <DeprecatedSectionHeader title="Last Week Coach Summary" />
      </div>
    </div>
  );
}
