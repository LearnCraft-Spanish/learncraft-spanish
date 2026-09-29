import type { UsingAsStudentContextType } from '@application/coordinators/contexts/UsingAsStudentContext';
import UsingAsStudentContext from '@application/coordinators/contexts/UsingAsStudentContext';
import { useMemo, useState } from 'react';

export function UsingAsStudentProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isUsingAsStudent, setIsUsingAsStudent] = useState(false);

  const value: UsingAsStudentContextType = useMemo(
    () => ({
      isUsingAsStudent,
      setIsUsingAsStudent,
    }),
    [isUsingAsStudent],
  );

  return (
    <UsingAsStudentContext value={value}>{children}</UsingAsStudentContext>
  );
}
