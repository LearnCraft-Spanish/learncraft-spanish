import type { Coach, Student } from '../CoachingTypes';

interface CoachSelectProps {
  coaches: { current: Coach[] };
  students: { current: Student[] };
  updateCoachFilter: (value: string) => void;
}
export default function CoachSelect({
  coaches,
  students,
  updateCoachFilter,
}: CoachSelectProps) {
  const coachSelector = [
    <option key={0} value={0}>
      All Coaches
    </option>,
  ];
  coaches.current.forEach((coach) => {
    const coachHasActiveStudent =
      students.current.filter(
        (student) =>
          (student.primaryCoach ? student.primaryCoach.id : undefined) ===
          (coach.user ? coach.user.id : 0),
      ).length > 0;
    if (coachHasActiveStudent) {
      coachSelector.push(
        <option key={coach.recordId} value={coach.recordId}>
          {coach.user.name}
        </option>,
      );
    }
  });
  return (
    <select onChange={(e) => updateCoachFilter(e.target.value)}>
      {/* <option key={0} value={0}>
        All Coaches
      </option> */}
      {coachSelector}
    </select>
  );
}
