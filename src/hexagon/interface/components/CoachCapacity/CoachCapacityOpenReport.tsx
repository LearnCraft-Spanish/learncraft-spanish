import type { CoachCapacityPeriod } from '@domain/functions/coachCapacity';
import type { JSX } from 'react';
import { useCoachCapacityReport } from '@application/useCases/useCoachCapacityReport';
import { CoachCapacityTable } from '@interface/components/CoachCapacity/CoachCapacityTable';

export interface CoachCapacityReportTableProps {
  period: CoachCapacityPeriod;
}

export function CoachCapacityReportTable({
  period,
}: CoachCapacityReportTableProps): JSX.Element {
  const {
    tableProps,
    isError,
    saveError,
    openNotes,
    notesPanel,
    openDrilldown,
    drilldown,
  } = useCoachCapacityReport(period);

  return (
    <CoachCapacityTable
      tableProps={tableProps}
      isError={isError}
      saveError={saveError}
      onOpenNotes={openNotes}
      notesPanel={notesPanel}
      onOpenDrilldown={openDrilldown}
      drilldown={drilldown}
    />
  );
}
