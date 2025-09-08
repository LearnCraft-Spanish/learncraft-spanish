import type { UseExampleFilterReturnType } from '../../units/useExampleFilter';
import type { CustomQuizFilterState } from './types';
import { useCallback, useMemo } from 'react';
import useExampleFilter from '../../units/useExampleFilter';

export function useCustomQuizFilterState() {
  const exampleFilter: UseExampleFilterReturnType = useExampleFilter();

  const removeSkillTagFromFilters = useCallback(
    (tagId: string) => {
      exampleFilter.filterState.removeSkillTagFromFilters(tagId);
      exampleFilter.skillTagSearch.addTagBackToSuggestions(tagId);
    },
    [exampleFilter.filterState, exampleFilter.skillTagSearch],
  );

  // turn return type into memo
  const memoizedReturn = useMemo(
    () =>
      ({
        // Exclude Spanglish
        excludeSpanglish:
          exampleFilter.filterState.filterState.excludeSpanglish,
        updateExcludeSpanglish:
          exampleFilter.filterState.updateExcludeSpanglish,
        // Audio Only
        audioOnly: exampleFilter.filterState.filterState.audioOnly,
        updateAudioOnly: exampleFilter.filterState.updateAudioOnly,

        // Tag Search
        tagSearchTerm: exampleFilter.skillTagSearch.tagSearchTerm,
        updateTagSearchTerm: exampleFilter.skillTagSearch.updateTagSearchTerm,
        tagSuggestions: exampleFilter.skillTagSearch.tagSuggestions,
        addSkillTagToFilters: exampleFilter.filterState.addSkillTagToFilters,
        removeTagFromSuggestions:
          exampleFilter.skillTagSearch.removeTagFromSuggestions,

        // Selected Tags
        skillTags: exampleFilter.filterState.filterState.skillTags,
        removeSkillTagFromFilters,
      }) satisfies CustomQuizFilterState,
    [
      exampleFilter.filterState,
      exampleFilter.skillTagSearch,
      removeSkillTagFromFilters,
    ],
  );

  return {
    filterState: memoizedReturn,
  };
}
