import type { ActiveStudentContextType } from '@application/coordinators/contexts/ActiveStudentContext';
import ActiveStudentContext from '@application/coordinators/contexts/ActiveStudentContext';
import { use } from 'react';

export function useActiveStudent(): ActiveStudentContextType {
  const context = use(ActiveStudentContext);
  if (!context) {
    throw new Error(
      'useActiveStudent must be used within a ActiveStudentProvider',
    );
  }
  return context;
}
