import { useAuthAdapter } from '@application/adapters/authAdapter';
import { useExampleAdapter } from '@application/adapters/exampleAdapter';
import { useCombinedFilters } from '@application/units/Filtering/useCombinedFilters';
import { copyTableToClipboard } from '@interface/components/Tables/units/functions';
import React, { useCallback } from 'react';
import { toast } from 'react-toastify';
import { v4 as uuidv4 } from 'uuid';

export function CopyAllExamplesToClipboard(): React.ReactElement {
  const exampleAdapter = useExampleAdapter();
  const { isAdmin } = useAuthAdapter();
  const { filterState, isLoading: isLoadingCombinedFilters } =
    useCombinedFilters({ onFilterChange: () => {} });

  const handleCopyAllExamplesToClipboard = useCallback(() => {
    const promise = (async () => {
      const { examples } = await exampleAdapter.getFilteredExamples({
        skillTags: filterState.skillTags,
        lessonRanges: filterState.lessonRanges,
        excludeSpanglish: filterState.excludeSpanglish,
        audioOnly: filterState.audioOnly,
        page: 1,
        limit: 1000000,
        seed: uuidv4(),
        disableCache: true,
        includeUnpublished: filterState.includeUnpublished,
      });
      copyTableToClipboard({
        displayOrder: examples.map((example) => ({ recordId: example.id })),
        getExampleOrFlashcardById: (id) =>
          examples.find((example) => example.id === id) ?? null,
      });
    })();

    toast.promise(promise, {
      pending: 'Loading examples...',
      success: 'Added to clipboard',
      error: 'Failed to load examples',
    });
  }, [
    exampleAdapter,
    filterState.skillTags,
    filterState.lessonRanges,
    filterState.includeUnpublished,
    filterState.excludeSpanglish,
    filterState.audioOnly,
  ]);

  return (
    <button
      type="button"
      onClick={handleCopyAllExamplesToClipboard}
      disabled={!isAdmin || isLoadingCombinedFilters}
    >
      <p>Copy all examples to clipboard</p>
    </button>
  );
}
