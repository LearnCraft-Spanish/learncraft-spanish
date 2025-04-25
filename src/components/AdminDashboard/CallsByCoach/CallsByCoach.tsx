import { useEffect, useState } from 'react';
import GroupCallsByCoach from './GroupCallsByCoach';
import GroupCallsDrilldownTable from './GroupCallsDrilldownTable';
import PrivateCallsByCoach from './PrivateCallsByCoach';
import PrivateCallsDrilldownTable from './PrivateCallsDrilldownTable';

export default function CallsByCoach() {
  const [selectedReport, setSelectedReport] = useState<string | null>(null);
  const [groupCallsByCoachOpen, setGroupCallsByCoachOpen] = useState(false);
  const [privateCallsByCoachOpen, setPrivateCallsByCoachOpen] = useState(false);

  const updateSelectedReport = (str: string) => {
    setSelectedReport(str);
  };

  useEffect(() => {
    if (!groupCallsByCoachOpen && !privateCallsByCoachOpen) {
      setSelectedReport(null);
    }
  }, [groupCallsByCoachOpen, privateCallsByCoachOpen]);

  return (
    <div className="section-with-interactive-table">
      <div className="admin-dashboard-grid">
        <GroupCallsByCoach
          setSelectedReport={updateSelectedReport}
          isOpen={groupCallsByCoachOpen}
          setIsOpen={setGroupCallsByCoachOpen}
        />
        <PrivateCallsByCoach
          setSelectedReport={updateSelectedReport}
          isOpen={privateCallsByCoachOpen}
          setIsOpen={setPrivateCallsByCoachOpen}
        />
      </div>
      {selectedReport?.includes('Group') && (
        <GroupCallsDrilldownTable selectedReport={selectedReport} />
      )}
      {selectedReport?.includes('Calls') && (
        <PrivateCallsDrilldownTable selectedReport={selectedReport} />
      )}
    </div>
  );
}
