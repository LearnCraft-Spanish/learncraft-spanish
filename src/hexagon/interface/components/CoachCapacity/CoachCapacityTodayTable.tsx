import type { JSX } from 'react';
import { useCoachCapacityTodayReport } from '@application/useCases/useCoachCapacityTodayReport';
import { CoachCapacityTable } from '@interface/components/CoachCapacity/CoachCapacityTable';

export function CoachCapacityTodayTable(): JSX.Element {
  const { rows, columns, isLoading, isError } = useCoachCapacityTodayReport();

  return (
    <CoachCapacityTable
      rows={rows}
      columns={columns}
      isLoading={isLoading}
      isError={isError}
    />
  );
}
