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
    excludeSpanglish: false,
    audioOnly: false,
    skillTags: [],
  });

  const updateExampleFilters = useCallback((filters: ExampleFilterState) => {
    setExampleFilters(filters);
  }, []);

  const value: ExampleFilterContextType = useMemo(
    () => ({
      exampleFilters,
      updateExampleFilters,
    }),
    [exampleFilters, updateExampleFilters],
  );

  return <ExampleFilterContext value={value}>{children}</ExampleFilterContext>;
}
