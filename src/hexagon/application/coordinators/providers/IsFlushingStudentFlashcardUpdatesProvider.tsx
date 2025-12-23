import type { IsFlushingStudentFlashcardUpdatesContextType } from '@application/coordinators/contexts/IsFlushingStudentFlashcardUpdates';
import IsFlushingStudentFlashcardUpdatesContext from '@application/coordinators/contexts/IsFlushingStudentFlashcardUpdates';
import { useMemo, useState } from 'react';

export function IsFlushingStudentFlashcardUpdatesProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isFlushing, setIsFlushing] = useState(false);

  const value: IsFlushingStudentFlashcardUpdatesContextType = useMemo(
    () => ({
      isFlushing,
      setIsFlushing,
    }),
    [isFlushing, setIsFlushing],
  );

  return (
    <IsFlushingStudentFlashcardUpdatesContext value={value}>
      {children}
    </IsFlushingStudentFlashcardUpdatesContext>
  );
}
