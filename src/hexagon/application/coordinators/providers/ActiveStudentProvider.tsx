import type { ActiveStudentContextType } from '@application/coordinators/contexts/ActiveStudentContext';
import ActiveStudentContext from '@application/coordinators/contexts/ActiveStudentContext';
import { useCallback, useMemo, useState } from 'react';

export function ActiveStudentProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [activeStudentEmail, setActiveStudentEmail] = useState<string | null>(
    null,
  );

  const updateActiveStudentEmail = useCallback(
    (emailAddress: string | null) => {
      setActiveStudentEmail(emailAddress);
    },
    [setActiveStudentEmail],
  );

  const returnValue: ActiveStudentContextType = useMemo(
    () => ({
      activeStudentEmail,
      updateActiveStudentEmail,
    }),
    [activeStudentEmail, updateActiveStudentEmail],
  );

  return (
    <ActiveStudentContext value={returnValue}>{children}</ActiveStudentContext>
  );
}
