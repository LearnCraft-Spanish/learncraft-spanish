import { useContextualMenu } from 'src/hooks/useContextualMenu';
import DrilldownTable from './Drilldowntable';
import LastWeekCoachSummary from './LastWeekCoachSummary';
import WeekCoachSummary from './WeekCoachSummary';

export default function WeeklySummaries() {
  const { contextual } = useContextualMenu();
  return (
    <div>
      <WeekCoachSummary />
      <LastWeekCoachSummary />

      {contextual.startsWith('week-drilldown') && <DrilldownTable />}
    </div>
  );
}
