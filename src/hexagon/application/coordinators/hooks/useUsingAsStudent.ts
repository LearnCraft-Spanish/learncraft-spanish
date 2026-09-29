import UsingAsStudentContext from '@application/coordinators/contexts/UsingAsStudentContext';
import { use } from 'react';

export interface UseUsingAsStudentReturnType {
  /** A coach/admin has chosen a student to use the app as. False by default. */
  isUsingAsStudent: boolean;
  setIsUsingAsStudent: (isUsingAsStudent: boolean) => void;
}

export function useUsingAsStudent(): UseUsingAsStudentReturnType {
  const context = use(UsingAsStudentContext);
  if (!context) {
    throw new Error(
      'useUsingAsStudent must be used within a UsingAsStudentProvider',
    );
  }
  return context;
}
