import { useContext } from 'react';

import { DateRangeContext } from './DateRangeContext';

export function useDateRange() {
  const context = useContext(DateRangeContext);
  if (context === undefined) {
    throw new Error('useDateRange must be used within a DateRangeProvider');
  }
  return context;
}

export default useDateRange;
