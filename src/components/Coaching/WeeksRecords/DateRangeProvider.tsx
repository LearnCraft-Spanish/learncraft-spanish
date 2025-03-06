import type { ReactNode } from 'react';
import React, { useMemo, useState } from 'react';
import getDateRange from '../general/functions/dateRange';
import getWeekEnds from '../general/functions/getWeekEnds';
import { DateRangeContext } from './DateRangeContext';

export function DateRangeProvider({ children }: { children: ReactNode }) {
  const dateRange = getDateRange();
  // depending on day of week, initialize startDate to this week or last week
  const [startDate, setStartDate] = useState<string>(
    dateRange.dayOfWeek >= 3
      ? dateRange.thisWeekDate
      : dateRange.lastSundayDate,
  );

  const endDate = useMemo(() => getWeekEnds(startDate), [startDate]);

  const value = useMemo(
    () => ({ startDate, endDate, setStartDate }),
    [startDate, endDate, setStartDate],
  );

  return <DateRangeContext value={value}>{children}</DateRangeContext>;
}
