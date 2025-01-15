import type { Coach } from '../../../../types/CoachingTypes';
import useCoaching from '../../../../hooks/useCoaching';

interface CoachSelectProps {
  updateCoachFilter: (recordId: string) => void;
  filterByCoach: Coach | undefined;
}

export default function CoachSelect({
  updateCoachFilter,
  filterByCoach,
}: CoachSelectProps) {
  const { coachListQuery, activeStudentsQuery } = useCoaching();

  const dataReady = coachListQuery.isSuccess && activeStudentsQuery.isSuccess;

  return (
    dataReady && (
      <div>
        <label htmlFor="coachSelector">Coach:</label>
        <select
          name="coachSelector"
          id="coachSelector"
          onChange={(e) => updateCoachFilter(e.target.value)}
          value={filterByCoach ? filterByCoach.recordId : -1}
        >
          <option key={0} value={0}>
            All Coaches
          </option>
          {coachListQuery.data.map((coach) => {
            const coachHasActiveStudent =
              activeStudentsQuery.data.filter(
                (student) =>
                  (student.primaryCoach
                    ? student.primaryCoach.id
                    : undefined) === (coach.user ? coach.user.id : 0),
              ).length > 0;
            if (coachHasActiveStudent) {
              return (
                <option key={coach.recordId} value={coach.recordId}>
                  {coach.user.name}
                </option>
              );
            }
          })}
        </select>
      </div>
    )
  );
}
