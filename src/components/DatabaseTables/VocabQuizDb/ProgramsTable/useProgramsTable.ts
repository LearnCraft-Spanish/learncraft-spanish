import type { UseAllCoursesQueryReturn } from '@application/queries/useAllCoursesQuery';
import type { CourseDetailed } from '@learncraft-spanish/shared';
import { useAllCoursesQuery } from '@application/queries/useAllCoursesQuery';
import { useCoursesMutations } from '@application/queries/useCoursesMutations';
import { useCallback, useMemo, useState } from 'react';
import { toast } from 'react-toastify';
import { useContextualMenu } from 'src/hexagon/interface/hooks/useContextualMenu';
export interface UseProgramsTableReturn {
  programToEdit: CourseDetailed | null;
  programsTableQuery: UseAllCoursesQueryReturn;
  tableEditMode: boolean;
  setTableEditMode: (mode: boolean) => void;
  updateCourses: (courses: CourseDetailed[]) => Promise<CourseDetailed[]>;
  isUpdating: boolean;
  updateError: Error | null;
  states: {
    isLoading: boolean;
    isError: boolean;
    isSuccess: boolean;
  };
}
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

  const handleUpdateCourses = useCallback(
    async (courses: CourseDetailed[]) => {
      const promise = updateCourses(courses);
      toast.promise(promise, {
        pending: 'Updating programs...',
        success: 'Programs updated successfully!',
        error: 'Failed to update programs',
      });
      return promise;
    },
    [updateCourses],
  );

  return {
    programToEdit,
    programsTableQuery,
    tableEditMode,
    setTableEditMode,
    updateCourses: handleUpdateCourses,
    isUpdating,
    updateError,
    states: {
      isLoading: programsTableQuery.isLoading,
      isError: programsTableQuery.isError,
      isSuccess: programsTableQuery.isSuccess,
    },
  };
}
