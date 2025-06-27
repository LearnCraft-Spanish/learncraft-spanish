import type {
  ActiveStudentContextType,
  ActiveStudentSelection,
} from '@application/coordinators/contexts/ActiveStudentContext';
import ActiveStudentContext from '@application/coordinators/contexts/ActiveStudentContext';
import { useCallback, useMemo, useState } from 'react';

export function ActiveStudentProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [studentSelectionState, setStudentSelectionState] =
    useState<ActiveStudentSelection>({
      email: null,
      changed: false,
    });

  const updateSelectedStudent = useCallback(
    (selection: ActiveStudentSelection) => {
      setStudentSelectionState(selection);
    },
    [setStudentSelectionState],
  );

  const returnValue: ActiveStudentContextType = useMemo(
    () => ({
      studentSelectionState,
      updateSelectedStudent,
    }),
    [studentSelectionState, updateSelectedStudent],
  );

  return (
    <ActiveStudentContext value={returnValue}>{children}</ActiveStudentContext>
  );
}
