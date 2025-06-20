import type { ActiveStudentContextType } from '@application/coordinators/contexts/ActiveStudentContext';
import ActiveStudentContext from '@application/coordinators/contexts/ActiveStudentContext';
import { useQuery } from '@tanstack/react-query';
import { use } from 'react';
import { getStudentByEmail } from 'src/hexagon/application/ports/appUserPort';

export function useActiveStudent(): ActiveStudentContextType {
  const context = use(ActiveStudentContext);
  if (!context) {
    throw new Error(
      'useActiveStudent must be used within a ActiveStudentProvider',
    );
  }

  const { data: student } = useQuery({
    queryKey: ['student', context.studentEmail],
    queryFn: () => getStudentByEmail(context.studentEmail),
  });
  return context;
}
