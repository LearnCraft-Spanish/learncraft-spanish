import type { JSX } from 'react';
import { useCoachCapacityTodayReport } from '@application/useCases/useCoachCapacityTodayReport';
import { CoachCapacityTable } from '@interface/components/CoachCapacity/CoachCapacityTable';

export function CoachCapacityTodayTable(): JSX.Element {
  const { tableProps, isError, saveError, openNotes, notesPanel } =
    useCoachCapacityTodayReport();

  return (
    <CoachCapacityTable
      tableProps={tableProps}
      isError={isError}
      saveError={saveError}
      onOpenNotes={openNotes}
      notesPanel={notesPanel}
    />
  );
}
