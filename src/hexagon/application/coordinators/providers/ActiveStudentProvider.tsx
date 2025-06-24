import type { ActiveStudentContextType } from '@application/coordinators/contexts/ActiveStudentContext';
import ActiveStudentContext from '@application/coordinators/contexts/ActiveStudentContext';
import { useAppStudentList, useAppUser } from '@application/queries/useAppUser';
import { useCallback, useMemo, useState } from 'react';
import { z } from 'zod';
import { useAuthAdapter } from '../../adapters/authAdapter';

export function ActiveStudentProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { authUser } = useAuthAdapter();

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

  const emailToUse = useMemo(() => {
    if (!authUser.email) {
      return null;
    }
    if (authUser.roles.includes('read:all-students')) {
      return studentEmail;
    }
    return authUser.email;
  }, [authUser, studentEmail]);

  const { appUser } = useAppUser(emailToUse || '');
  const { appStudentList } = useAppStudentList();

  const returnValue: ActiveStudentContextType = useMemo(
    () => ({
      appUser,
      appStudentList,
      studentEmail,
      updateStudentEmail,
    }),
    [appUser, appStudentList, studentEmail, updateStudentEmail],
  );

  return (
    <ActiveStudentContext value={returnValue}>{children}</ActiveStudentContext>
  );
}
