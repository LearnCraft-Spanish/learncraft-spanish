import type {
  ExampleFilterContextType,
  ExampleFilterStateWithoutLesson,
} from '@application/coordinators/contexts/ExampleFilterContext';
import { ExampleFilterContext } from '@application/coordinators/contexts/ExampleFilterContext';
import { useCallback, useMemo, useState } from 'react';

export function ExampleFilterContextProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [exampleFilters, setExampleFilters] =
    useState<ExampleFilterStateWithoutLesson>({
      excludeSpanglish: false,
      audioOnly: false,
      skillTagKeys: [],
    });

  const updateExampleFilters = useCallback(
    (filters: ExampleFilterStateWithoutLesson) => {
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
