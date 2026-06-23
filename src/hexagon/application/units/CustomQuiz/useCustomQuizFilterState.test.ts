import { useCustomQuizFilterState } from '@application/units/CustomQuiz/useCustomQuizFilterState';
import { renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mockRemoveSkillTagFromFilters = vi.fn();
const mockAddSkillTagToFilters = vi.fn();
const mockUpdateExcludeSpanglish = vi.fn();
const mockUpdateAudioOnly = vi.fn();
const mockUpdateTagSearchTerm = vi.fn();
const mockRemoveTagFromSuggestions = vi.fn();
const mockAddTagBackToSuggestions = vi.fn();

const defaultCombinedFiltersReturn = {
  excludeSpanglish: false,
  updateExcludeSpanglish: mockUpdateExcludeSpanglish,
  audioOnly: false,
  updateAudioOnly: mockUpdateAudioOnly,
  addSkillTagToFilters: mockAddSkillTagToFilters,
  removeSkillTagFromFilters: mockRemoveSkillTagFromFilters,
  selectedSkillTags: [],
  skillTagSearch: {
    tagSearchTerm: '',
    updateTagSearchTerm: mockUpdateTagSearchTerm,
    tagSuggestions: [],
    removeTagFromSuggestions: mockRemoveTagFromSuggestions,
    addTagBackToSuggestions: mockAddTagBackToSuggestions,
    isLoading: false,
    error: null,
  },
};

vi.mock('@application/units/Filtering/useCombinedFilters', () => ({
  useCombinedFilters: () => defaultCombinedFiltersReturn,
}));

vi.mock('@application/units/useSkillTagSearch', () => ({
  useSkillTagSearch: () => ({
    tagSearchTerm: '',
    tagSuggestions: [],
    updateTagSearchTerm: mockUpdateTagSearchTerm,
    removeTagFromSuggestions: mockRemoveTagFromSuggestions,
    addTagBackToSuggestions: mockAddTagBackToSuggestions,
    isLoading: false,
    error: null,
  }),
}));

describe('useCustomQuizFilterState', () => {
  beforeEach(() => {
    mockRemoveSkillTagFromFilters.mockClear();
    mockAddTagBackToSuggestions.mockClear();
  });

  it('returns a filterState shape with delegated fields', () => {
    const { result } = renderHook(() => useCustomQuizFilterState());
    const { filterState } = result.current;

    expect(filterState.excludeSpanglish).toBe(false);
    expect(filterState.audioOnly).toBe(false);
    expect(filterState.skillTags).toEqual([]);
    expect(filterState.tagSearchTerm).toBe('');
    expect(typeof filterState.addSkillTagToFilters).toBe('function');
    expect(typeof filterState.removeSkillTagFromFilters).toBe('function');
    expect(typeof filterState.updateTagSearchTerm).toBe('function');
  });

  it('calls both removeSkillTagFromFilters and addTagBackToSuggestions when removing a tag', () => {
    const { result } = renderHook(() => useCustomQuizFilterState());
    result.current.filterState.removeSkillTagFromFilters('tag-1');

    expect(mockRemoveSkillTagFromFilters).toHaveBeenCalledWith('tag-1');
    expect(mockAddTagBackToSuggestions).toHaveBeenCalledWith('tag-1');
  });
});
