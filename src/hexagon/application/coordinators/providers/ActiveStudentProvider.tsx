import type { ActiveStudentContextType } from '@application/coordinators/contexts/ActiveStudentContext';
import ActiveStudentContext from '@application/coordinators/contexts/ActiveStudentContext';
import { useCallback, useMemo, useState } from 'react';
import { z } from 'zod';

export function ActiveStudentProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [studentEmail, setStudentEmail] = useState<string | null>(null);

  const updateStudentEmail = useCallback(
    (studentEmail: string) => {
      const parsedEmail = z.string().email().safeParse(studentEmail);
      if (parsedEmail.success) {
        setStudentEmail(parsedEmail.data);
      } else {
        console.error('Invalid email', parsedEmail.error);
      }
    },
    [setStudentEmail],
  );

  const returnValue: ActiveStudentContextType = useMemo(
    () => ({
      studentEmail,
      updateStudentEmail,
    }),
    [studentEmail, updateStudentEmail],
  );

  return (
    <ActiveStudentContext value={returnValue}>{children}</ActiveStudentContext>
  );
}
