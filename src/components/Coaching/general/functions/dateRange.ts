export default function getDateRange(numWeeks: number = 4) {
  // Get current UTC timestamp
  const now = new Date();
  const dayOfWeek = now.getUTCDay();

  const weekInMs = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds

  // Generate array of dates
  const dates = Array.from({ length: numWeeks }, (_, i) => {
    const msOffset = i * weekInMs;
    const date = new Date(now.getTime() - dayOfWeek * 86400000 - msOffset);
    return {
      date: date.toISOString().split('T')[0],
      label:
        i === 0
          ? 'This Week'
          : i === 1
            ? 'Last Week'
            : i === 2
              ? 'Two Weeks Ago'
              : undefined,
    };
  });

  // Convert to object format for backward compatibility
  const result: Record<string, string> = {
    dayOfWeekString: dayOfWeek.toString(),
    nextWeekDate: new Date(now.getTime() - dayOfWeek * 86400000 + weekInMs)
      .toISOString()
      .split('T')[0],
  };

  dates.forEach(({ date }, i) => {
    if (i === 0) result.thisWeekDate = date;
    else if (i === 1) result.lastSundayDate = date;
    else if (i === 2) result.twoSundaysAgoDate = date;
    else result[`${i + 1}SundaysAgoDate`] = date;
  });

  return result;
}
