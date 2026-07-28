import { useEffect, useState } from 'react';
import GroupCallsByCoach from './GroupCallsByCoach';
import GroupCallsDrilldownTable from './GroupCallsDrilldownTable';
import PrivateCallsByCoach from './PrivateCallsByCoach';

export default function CallsByCoach() {
  const [privateCallsByCoachOpen, setPrivateCallsByCoachOpen] = useState(false);

  const [selectedReport, setSelectedReport] = useState<string | null>(null);
  const [groupCallsByCoachOpen, setGroupCallsByCoachOpen] = useState(false);

  const updateSelectedReport = (str: string) => {
    setSelectedReport(str);
  };

  useEffect(() => {
    if (!groupCallsByCoachOpen) {
      setSelectedReport(null);
    }
  }, [groupCallsByCoachOpen]);

  return (
    <div className="section-with-interactive-table">
      <div className="admin-dashboard-grid">
        <PrivateCallsByCoach
          setSelectedReport={() => undefined}
          isOpen={privateCallsByCoachOpen}
          setIsOpen={setPrivateCallsByCoachOpen}
        />
        <GroupCallsByCoach
          setSelectedReport={updateSelectedReport}
          isOpen={groupCallsByCoachOpen}
          setIsOpen={setGroupCallsByCoachOpen}
        />
      </div>
      {selectedReport?.includes('Group') && (
        <GroupCallsDrilldownTable selectedReport={selectedReport} />
      )}
    </div>
  );
}
