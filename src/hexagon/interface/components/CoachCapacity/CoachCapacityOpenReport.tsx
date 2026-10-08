import type { JSX } from 'react';
import { useCoachCapacityReport } from '@application/useCases/useCoachCapacityReport';
import { CoachCapacityPeriodToggle } from '@interface/components/CoachCapacity/CoachCapacityPeriodToggle';
import { CoachCapacityTable } from '@interface/components/CoachCapacity/CoachCapacityTable';
import SectionHeader from '@interface/components/general/SectionHeader/SectionHeader';

export interface CoachCapacityOpenReportProps {
  title: string;
  onClose: () => void;
}

export function CoachCapacityOpenReport({
  title,
  onClose,
}: CoachCapacityOpenReportProps): JSX.Element {
  const {
    period,
    selectPeriod,
    tableProps,
    isError,
    saveError,
    openNotes,
    notesPanel,
    openDrilldown,
    drilldown,
  } = useCoachCapacityReport();

  return (
    <>
      <SectionHeader
        title={title}
        isOpen
        openFunction={onClose}
        button={
          <CoachCapacityPeriodToggle period={period} onSelect={selectPeriod} />
        }
      />
      <CoachCapacityTable
        tableProps={tableProps}
        isError={isError}
        saveError={saveError}
        onOpenNotes={openNotes}
        notesPanel={notesPanel}
        onOpenDrilldown={openDrilldown}
        drilldown={drilldown}
      />
    </>
  );
}
