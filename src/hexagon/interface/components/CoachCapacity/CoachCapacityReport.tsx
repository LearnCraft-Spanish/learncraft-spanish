import type { CoachCapacityPeriod } from '@domain/functions/coachCapacity';
import type { JSX } from 'react';
import { CoachCapacityReportTable } from '@interface/components/CoachCapacity/CoachCapacityReportTable';
import SectionHeader from '@interface/components/general/SectionHeader/SectionHeader';
import { useState } from 'react';

const REPORT_TITLES: Record<CoachCapacityPeriod, string> = {
  today: 'Coach Capacity: Today',
  twoWeeksOut: 'Coach Capacity: Two Weeks Out',
};

export interface CoachCapacityReportProps {
  period: CoachCapacityPeriod;
}

export function CoachCapacityReport({
  period,
}: CoachCapacityReportProps): JSX.Element {
  const [isOpen, setIsOpen] = useState(false);
  const title = REPORT_TITLES[period];

  return (
    <section aria-label={title}>
      <SectionHeader
        title={title}
        isOpen={isOpen}
        openFunction={() => setIsOpen(!isOpen)}
      />
      {/* Mounting the table on open is what refetches the report each time */}
      {isOpen && <CoachCapacityReportTable period={period} />}
    </section>
  );
}
