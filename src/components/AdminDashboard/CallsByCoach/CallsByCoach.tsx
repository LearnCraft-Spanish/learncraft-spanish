import { useState } from 'react';
import DeprecatedSectionHeader from '../DeprecatedSectionHeader';
import PrivateCallsByCoach from './PrivateCallsByCoach';

/* Deprecated — re-enable when group calls and calls drilldown are migrated.
import { useEffect } from 'react';
import GroupCallsByCoach from './GroupCallsByCoach';
import GroupCallsDrilldownTable from './GroupCallsDrilldownTable';
import PrivateCallsDrilldownTable from './PrivateCallsDrilldownTable';
*/

export default function CallsByCoach() {
  const [privateCallsByCoachOpen, setPrivateCallsByCoachOpen] = useState(false);

  return (
    <div className="section-with-interactive-table">
      <div className="admin-dashboard-grid">
        <DeprecatedSectionHeader title="Group Calls by Coach" />
        <PrivateCallsByCoach
          setSelectedReport={() => undefined}
          isOpen={privateCallsByCoachOpen}
          setIsOpen={setPrivateCallsByCoachOpen}
        />
      </div>
    </div>
  );
}
