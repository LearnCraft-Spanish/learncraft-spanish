import TempIdContext from '@application/coordinators/contexts/TempIdContext';
import { use } from 'react';

export function useTempId() {
  const context = use(TempIdContext);
  if (!context) {
    throw new Error('useTempId must be used within a TempIdContextProvider');
  }
  return context;
}
