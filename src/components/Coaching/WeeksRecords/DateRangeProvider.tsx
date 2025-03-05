import type { ReactNode } from 'react';
import React, { useMemo, useState } from 'react';
import getDateRange from '../general/functions/dateRange';
import { DateRangeContext } from './DateRangeContext';

export function DateRangeProvider({ children }: { children: ReactNode }) {
  const dateRange = getDateRange();
  // depending on day of week, initialize startDate to this week or last week
  const [startDate, setStartDate] = useState<string>(
    dateRange.dayOfWeek >= 3
      ? dateRange.thisWeekDate
      : dateRange.lastSundayDate,
  );
  const [endDate, setEndDate] = useState<string>(
    dateRange.dayOfWeek >= 3 ? dateRange.nextWeekDate : dateRange.thisWeekDate,
  );

  const value = useMemo(
    () => ({ startDate, endDate, setStartDate, setEndDate }),
    [startDate, endDate, setStartDate, setEndDate],
  );

  return <DateRangeContext value={value}>{children}</DateRangeContext>;
}
