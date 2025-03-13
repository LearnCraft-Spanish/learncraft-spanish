import { createContext } from 'react';

export interface DateRangeContextType {
  startDate: string;
  endDate: string;
  setStartDate: (date: string) => void;
}

export const DateRangeContext = createContext<DateRangeContextType | undefined>(
  undefined,
);
