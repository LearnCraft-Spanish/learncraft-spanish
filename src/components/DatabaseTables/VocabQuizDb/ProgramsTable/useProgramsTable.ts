import type { CourseDetailed } from '@learncraft-spanish/shared';
import { useAllCoursesQuery } from '@application/queries/useAllCoursesQuery';
import { useCoursesMutations } from '@application/queries/useCoursesMutations';
import { useMemo, useState } from 'react';
import { useContextualMenu } from 'src/hexagon/interface/hooks/useContextualMenu';

export default function useProgramsTable() {
  const programsTableQuery = useAllCoursesQuery();
  const {
    updateCourses,
    isPending: isUpdating,
    error: updateError,
  } = useCoursesMutations();
  const { contextual } = useContextualMenu();
  const [tableEditMode, setTableEditMode] = useState(false);

  const programToEdit = useMemo((): CourseDetailed | null => {
    if (!contextual.startsWith('edit-program-')) {
      return null;
    }
    const id = Number(contextual.split('edit-program-')[1]);
    return (
      programsTableQuery.data?.find((program) => program.id === id) ?? null
    );
  }, [programsTableQuery.data, contextual]);

  return {
    programToEdit,
    programsTableQuery,
    tableEditMode,
    setTableEditMode,
    updateCourses,
    isUpdating,
    updateError,
    states: {
      isLoading: programsTableQuery.isLoading,
      isError: programsTableQuery.isError,
      isSuccess: programsTableQuery.isSuccess,
    },
  };
}
