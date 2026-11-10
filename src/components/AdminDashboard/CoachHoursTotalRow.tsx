import type { MembershipsByCoach } from '@learncraft-spanish/shared';

export function sumWeeklyPrivateCalls(data: MembershipsByCoach[]): number {
  const total = data.reduce((sum, row) => sum + row.totalWeeklyPrivateCalls, 0);
  // Round to avoid floating point artifacts from fractional hours (e.g. 0.1 + 0.2)
  return Math.round(total * 100) / 100;
}

export default function CoachHoursTotalRow({
  data,
}: {
  data: MembershipsByCoach[];
}) {
  return (
    <tr>
      <td>Total</td>
      <td>{sumWeeklyPrivateCalls(data)}</td>
    </tr>
  );
}
