import type { JSX } from 'react';
import { CoachCapacityOpenReport } from '@interface/components/CoachCapacity/CoachCapacityOpenReport';
import SectionHeader from '@interface/components/general/SectionHeader/SectionHeader';
import { useState } from 'react';

const TITLE = 'Coach Capacity';

export function CoachCapacityReport(): JSX.Element {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <section aria-label={TITLE}>
      {/* Mounting the report on open is what refetches it and starts it on Today */}
      {isOpen ? (
        <CoachCapacityOpenReport
          title={TITLE}
          onClose={() => setIsOpen(false)}
        />
      ) : (
        <SectionHeader
          title={TITLE}
          isOpen={false}
          openFunction={() => setIsOpen(true)}
        />
      )}
    </section>
  );
}
