import { InlineLoading } from 'src/components/Loading';
import { useContextualMenu } from 'src/hooks/useContextualMenu';
import useDrilldownTable from './useDrilldownTable';

export default function DrilldownTable() {
  const { contextual } = useContextualMenu();
  const coachId = contextual.split('_')[1];
  const report = contextual.split('_')[2];

  if (!coachId || !report) {
    throw new Error('Coach ID or report not found');
  }

  const { data, isLoading, isError, isSuccess } = useDrilldownTable(
    coachId,
    report,
  );
  return (
    <div>
      {isLoading && <InlineLoading />}
      {isError && <div>Error</div>}
      {isSuccess && <div>DrilldownTable: {data.length}</div>}
    </div>
  );
}
