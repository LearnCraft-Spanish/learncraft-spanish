export default function getWeekEnds(weekStarts: string) {
  return new Date(new Date(weekStarts).getTime() + 6 * 24 * 60 * 60 * 1000)
    .toISOString()
    .split('T')[0];
}
