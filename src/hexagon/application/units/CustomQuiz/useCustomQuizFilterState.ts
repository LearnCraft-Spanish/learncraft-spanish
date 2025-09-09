import type { CustomQuizFilterState } from './types';
import { useCombinedFilters } from '@application/units/Filtering/useCombinedFilters';
import { useCallback, useMemo } from 'react';
import { useSkillTagSearch } from '../useSkillTagSearch';

export function useCustomQuizFilterState() {
  const filterState = useCombinedFilters();

  const { addTagBackToSuggestions } = useSkillTagSearch();

  const removeSkillTagFromFilters = useCallback(
    (tagId: string) => {
      filterState.removeSkillTagFromFilters(tagId);
      addTagBackToSuggestions(tagId);
    },
    [filterState, addTagBackToSuggestions],
  );

  // turn return type into memo
  const memoizedReturn = useMemo(
    () =>
      ({
        // Exclude Spanglish
        excludeSpanglish: filterState.excludeSpanglish,
        updateExcludeSpanglish: filterState.updateExcludeSpanglish,
        // Audio Only
        audioOnly: filterState.audioOnly,
        updateAudioOnly: filterState.updateAudioOnly,

        // Tag Search
        tagSearchTerm: filterState.skillTagSearch.tagSearchTerm,
        updateTagSearchTerm: filterState.skillTagSearch.updateTagSearchTerm,
        tagSuggestions: filterState.skillTagSearch.tagSuggestions,
        addSkillTagToFilters: filterState.addSkillTagToFilters,
        removeTagFromSuggestions:
          filterState.skillTagSearch.removeTagFromSuggestions,

        // Selected Tags
        skillTags: filterState.selectedSkillTags,
        removeSkillTagFromFilters,
      }) satisfies CustomQuizFilterState,
    [filterState, removeSkillTagFromFilters],
  );

  return {
    filterState: memoizedReturn,
  };
}
