import type {
  ExampleFilterContextType,
  ExampleFilterStateWithoutCourseAndLesson,
} from '@application/coordinators/contexts/ExampleFilterContext';
import { ExampleFilterContext } from '@application/coordinators/contexts/ExampleFilterContext';
import { useCallback, useMemo, useState } from 'react';

export function ExampleFilterContextProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [exampleFilters, setExampleFilters] =
    useState<ExampleFilterStateWithoutCourseAndLesson>({
      includeSpanglish: false,
      audioOnly: false,
      skillTagKeys: [],
    });

  const updateExampleFilters = useCallback(
    (filters: ExampleFilterStateWithoutCourseAndLesson) => {
      setExampleFilters(filters);
    },
    [],
  );

  const value: ExampleFilterContextType = useMemo(
    () => ({
      exampleFilters,
      updateExampleFilters,
    }),
    [exampleFilters, updateExampleFilters],
  );

  return <ExampleFilterContext value={value}>{children}</ExampleFilterContext>;
}
