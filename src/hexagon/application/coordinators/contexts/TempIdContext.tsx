import { createContext } from 'react';

export interface TempIdContextType {
  getNextTempId: () => number;
}

const TempIdContext = createContext<TempIdContextType>({
  getNextTempId: () => -1, // Always negative
});

export default TempIdContext;
