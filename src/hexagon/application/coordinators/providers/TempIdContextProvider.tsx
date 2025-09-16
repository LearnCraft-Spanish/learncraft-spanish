import type { TempIdContextType } from '../contexts/TempIdContext';
import { useCallback, useMemo, useRef } from 'react';
import TempIdContext from '../contexts/TempIdContext';

export default function TempIdContextProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  // Arbitrary number to start at, avoids zero
  const START_NUMBER = -5;
  const lastTempIdRef = useRef<number>(START_NUMBER);

  const getNextTempId = useCallback(() => {
    lastTempIdRef.current--;
    return lastTempIdRef.current;
  }, []);

  const value: TempIdContextType = useMemo(
    () => ({
      getNextTempId,
    }),
    [getNextTempId],
  );

  return <TempIdContext value={value}>{children}</TempIdContext>;
}
