import type { JSX } from 'react';
import { CoachCapacityTodayTable } from '@interface/components/CoachCapacity/CoachCapacityTodayTable';
import SectionHeader from '@interface/components/general/SectionHeader/SectionHeader';
import { useState } from 'react';

export function CoachCapacityTodayReport(): JSX.Element {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div>
      <SectionHeader
        title="Coach Capacity: Today"
        isOpen={isOpen}
        openFunction={() => setIsOpen(!isOpen)}
      />
      {/* Mounting the table on open is what refetches the report each time */}
      {isOpen && <CoachCapacityTodayTable />}
    </div>
  );
}
