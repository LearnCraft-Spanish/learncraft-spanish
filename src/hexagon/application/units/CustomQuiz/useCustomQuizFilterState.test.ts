import { useCustomQuizFilterState } from '@application/units/CustomQuiz/useCustomQuizFilterState';
import {
  mockUseCombinedFilters,
  overrideMockUseCombinedFilters,
  resetMockUseCombinedFilters,
} from '@application/units/Filtering/useCombinedFilters.mock';
import {
  mockUseSkillTagSearch,
  resetMockUseSkillTagSearch,
} from '@application/units/useSkillTagSearch.mock';
import { act, renderHook } from '@testing-library/react';
import { createMockSkillTagList } from '@testing/factories/skillTagFactory';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const useCombinedFiltersSpy = vi.hoisted(() =>
  vi.fn(() => mockUseCombinedFilters),
);

vi.mock('@application/units/Filtering/useCombinedFilters', () => ({
  useCombinedFilters: useCombinedFiltersSpy,
}));

vi.mock('@application/units/useSkillTagSearch', async () => {
  const { mockUseSkillTagSearch: skillTagSearch } =
    await import('@application/units/useSkillTagSearch.mock');
  return { useSkillTagSearch: skillTagSearch };
});

describe('useCustomQuizFilterState', () => {
  beforeEach(() => {
    resetMockUseCombinedFilters();
    resetMockUseSkillTagSearch();
    useCombinedFiltersSpy.mockReset();
    useCombinedFiltersSpy.mockImplementation(() => mockUseCombinedFilters);
  });

  it('exposes the spanglish, audio, and tag fields the quiz setup reads', () => {
    const [porTag, porqueTag] = createMockSkillTagList(2).map((tag, index) => ({
      ...tag,
      key: `Vocabulary-${index + 1}`,
      name: index === 0 ? 'por' : 'porque',
    }));
    const tagSearch = {
      ...mockUseCombinedFilters.skillTagSearch,
      tagSearchTerm: 'por',
      tagSuggestions: [porqueTag],
    };
    overrideMockUseCombinedFilters({
      excludeSpanglish: true,
      audioOnly: false,
      selectedSkillTags: [porTag],
      skillTagSearch: tagSearch,
    });

    const { result } = renderHook(() => useCustomQuizFilterState());

    expect(useCombinedFiltersSpy).toHaveBeenCalledWith({});
    expect(mockUseSkillTagSearch).toHaveBeenCalledWith();
    expect(result.current.filterState.excludeSpanglish).toBe(true);
    expect(result.current.filterState.audioOnly).toBe(false);
    expect(result.current.filterState.tagSearchTerm).toBe('por');
    expect(result.current.filterState.tagSuggestions).toEqual([porqueTag]);
    expect(result.current.filterState.skillTags).toEqual([porTag]);
    expect(result.current.filterState.updateExcludeSpanglish).toBe(
      mockUseCombinedFilters.updateExcludeSpanglish,
    );
    expect(result.current.filterState.updateAudioOnly).toBe(
      mockUseCombinedFilters.updateAudioOnly,
    );
    expect(result.current.filterState.updateTagSearchTerm).toBe(
      tagSearch.updateTagSearchTerm,
    );
    expect(result.current.filterState.addSkillTagToFilters).toBe(
      mockUseCombinedFilters.addSkillTagToFilters,
    );
    expect(result.current.filterState.removeTagFromSuggestions).toBe(
      tagSearch.removeTagFromSuggestions,
    );
  });

  it('forwards filter updates and puts a removed tag back into suggestions', () => {
    const { result } = renderHook(() => useCustomQuizFilterState());
    const { addTagBackToSuggestions } = mockUseSkillTagSearch();

    act(() => {
      result.current.filterState.updateExcludeSpanglish(false);
      result.current.filterState.updateAudioOnly(true);
      result.current.filterState.addSkillTagToFilters('Vocabulary-1');
    });

    expect(mockUseCombinedFilters.updateExcludeSpanglish).toHaveBeenCalledWith(
      false,
    );
    expect(mockUseCombinedFilters.updateAudioOnly).toHaveBeenCalledWith(true);
    expect(mockUseCombinedFilters.addSkillTagToFilters).toHaveBeenCalledWith(
      'Vocabulary-1',
    );
    expect(addTagBackToSuggestions).not.toHaveBeenCalled();

    act(() => {
      result.current.filterState.removeSkillTagFromFilters('Vocabulary-1');
    });

    expect(
      mockUseCombinedFilters.removeSkillTagFromFilters,
    ).toHaveBeenCalledWith('Vocabulary-1');
    expect(addTagBackToSuggestions).toHaveBeenCalledTimes(1);
    expect(addTagBackToSuggestions).toHaveBeenCalledWith('Vocabulary-1');
  });
});
