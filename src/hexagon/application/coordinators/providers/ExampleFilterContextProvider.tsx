import type {
  ExampleFilterContextType,
  ExampleFilterState,
} from '@application/coordinators/contexts/ExampleFilterContext';
import { ExampleFilterContext } from '@application/coordinators/contexts/ExampleFilterContext';
import { useCallback, useMemo, useState } from 'react';

export function ExampleFilterContextProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [exampleFilters, setExampleFilters] = useState<ExampleFilterState>({
    includeSpanglish: false,
    audioOnly: false,
    skillTags: [],
    filterUuid: '',
  });
  const [filtersChanging, setFiltersChanging] = useState(true);

  const updateExampleFilters = useCallback((filters: ExampleFilterState) => {
    setExampleFilters(filters);
  }, []);

  const updateFiltersChanging = useCallback((filtersChanging: boolean) => {
    setFiltersChanging(filtersChanging);
  }, []);

  const value: ExampleFilterContextType = useMemo(
    () => ({
      exampleFilters,
      updateExampleFilters,
      filtersChanging,
      updateFiltersChanging,
    }),
    [
      exampleFilters,
      updateExampleFilters,
      filtersChanging,
      updateFiltersChanging,
    ],
  );

  return <ExampleFilterContext value={value}>{children}</ExampleFilterContext>;
}
