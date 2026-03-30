import { useAuthAdapter } from '@application/adapters/authAdapter';
import { ExampleFilterContext } from '@application/coordinators/contexts/ExampleFilterContext';
import { use, useCallback } from 'react';

export interface UseIncludeUnpublishedReturnType {
  includeUnpublished: boolean;
  updateIncludeUnpublished: (includeUnpublished: boolean) => void;
  isAdmin: boolean;
}

// this hook basically does a subset of the functionality of the useExampleFilterCoordinator hook
// kept separate because we don't need useSkillTags. may remove this hook in the future, and use just the useExampleFilterCoordinator hook instead.
export function useIncludeUnpublished(): UseIncludeUnpublishedReturnType {
  const { isAdmin } = useAuthAdapter();
  const { exampleFilters, updateExampleFilters } = use(ExampleFilterContext);

  const includeUnpublished = exampleFilters.includeUnpublished ?? false;

  const updateIncludeUnpublished = useCallback(
    (nextIncludeUnpublished: boolean) => {
      updateExampleFilters({
        ...exampleFilters,
        includeUnpublished: nextIncludeUnpublished,
      });
    },
    [exampleFilters, updateExampleFilters],
  );

  return { includeUnpublished, updateIncludeUnpublished, isAdmin };
}
