import type { SelectedExamplesContextType } from '@application/coordinators/contexts/SelectedExamplesContext';
import { SelectedExamplesContext } from '@application/coordinators/contexts/SelectedExamplesContext';
import { useCallback, useMemo, useState } from 'react';

export function SelectedExamplesProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [selectedExampleIds, setSelectedExampleIds] = useState<number[]>([]);
  const updateSelectedExamples = useCallback((exampleIds: number[]) => {
    setSelectedExampleIds(exampleIds);
  }, []);

  const addSelectedExample = useCallback((exampleId: number) => {
    setSelectedExampleIds((prev) => {
      const newIds = new Set([...prev, exampleId]);
      return Array.from(newIds);
    });
  }, []);

  const removeSelectedExample = useCallback((exampleId: number) => {
    setSelectedExampleIds((prev) => {
      const newIds = new Set(prev);
      newIds.delete(exampleId);
      return Array.from(newIds);
    });
  }, []);

  const clearSelectedExamples = useCallback(() => {
    setSelectedExampleIds([]);
  }, []);

  const value: SelectedExamplesContextType = useMemo(
    () => ({
      selectedExampleIds,
      updateSelectedExamples,
      addSelectedExample,
      removeSelectedExample,
      clearSelectedExamples,
    }),
    [
      selectedExampleIds,
      updateSelectedExamples,
      addSelectedExample,
      removeSelectedExample,
      clearSelectedExamples,
    ],
  );

  return (
    <SelectedExamplesContext value={value}>{children}</SelectedExamplesContext>
  );
}
