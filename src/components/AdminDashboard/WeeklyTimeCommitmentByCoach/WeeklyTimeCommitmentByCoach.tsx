import type { WeeklyTimeCommitmentByCoach as WeeklyTimeCommitmentByCoachData } from '@learncraft-spanish/shared';
import { useState } from 'react';
import DisplayOnlyTable from 'src/components/CoachingDashboard/components/RecentRecords/DisplayOnlyTable';
import SectionHeader from 'src/components/CoachingDashboard/components/SectionHeader';
import useWeeklyTimeCommitmentByCoach from 'src/hooks/AdminData/useWeeklyTimeCommitmentByCoach';

function formatHours(minutes: number): string {
  return `${(minutes / 60).toFixed(1)} hrs`;
}

function renderRow(data: WeeklyTimeCommitmentByCoachData) {
  const { coach, totalWeeklyTimeCommitmentMinutes } = data;
  return (
    <tr key={coach.coach_id}>
      <td>{coach.fullName}</td>
      <td>{formatHours(totalWeeklyTimeCommitmentMinutes)}</td>
    </tr>
  );
}

export default function WeeklyTimeCommitmentByCoach() {
  const { weeklyTimeCommitmentByCoachReportQuery } =
    useWeeklyTimeCommitmentByCoach();

  const [isOpen, setIsOpen] = useState(false);
  const headers = ['Coach', 'Weekly Time Commitment'];

  return (
    <div>
      <SectionHeader
        title="Weekly Time Commitment by Coach"
        isOpen={isOpen}
        openFunction={() => setIsOpen(!isOpen)}
      />
      {isOpen && (
        <DisplayOnlyTable
          headers={headers}
          data={weeklyTimeCommitmentByCoachReportQuery.data ?? []}
          renderRow={renderRow}
        />
      )}
    </div>
  );
}
