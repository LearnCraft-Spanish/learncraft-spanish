import type { SkillTag } from '@learncraft-spanish/shared';
import { useCustomQuizFilterState } from '@application/units/CustomQuiz/useCustomQuizFilterState';
import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const filters = vi.hoisted(() => ({
  excludeSpanglish: true as boolean | undefined,
  audioOnly: false as boolean | undefined,
  tagSearchTerm: 'por',
  tagSuggestions: [] as SkillTag[],
  skillTags: [] as SkillTag[],
}));

const updateExcludeSpanglish = vi.hoisted(() =>
  vi.fn<(excludeSpanglish: boolean) => void>(),
);
const updateAudioOnly = vi.hoisted(() => vi.fn<(audioOnly: boolean) => void>());
const addSkillTagToFilters = vi.hoisted(() =>
  vi.fn<(tagKey: string) => void>(),
);
const removeSkillTagFromFilters = vi.hoisted(() =>
  vi.fn<(tagId: string) => void>(),
);
const updateTagSearchTerm = vi.hoisted(() =>
  vi.fn<(target?: EventTarget & HTMLInputElement) => void>(),
);
const removeTagFromSuggestions = vi.hoisted(() =>
  vi.fn<(tagId: string) => void>(),
);
const addTagBackToSuggestions = vi.hoisted(() =>
  vi.fn<(tagId: string) => void>(),
);
const combinedFiltersSpy = vi.hoisted(() => vi.fn());
const skillTagSearchSpy = vi.hoisted(() => vi.fn());

vi.mock('@application/units/Filtering/useCombinedFilters', () => ({
  useCombinedFilters: (props: unknown) => {
    combinedFiltersSpy(props);
    return {
      excludeSpanglish: filters.excludeSpanglish,
      updateExcludeSpanglish,
      audioOnly: filters.audioOnly,
      updateAudioOnly,
      skillTagSearch: {
        tagSearchTerm: filters.tagSearchTerm,
        updateTagSearchTerm,
        tagSuggestions: filters.tagSuggestions,
        removeTagFromSuggestions,
      },
      addSkillTagToFilters,
      removeSkillTagFromFilters,
      selectedSkillTags: filters.skillTags,
    };
  },
}));

vi.mock('@application/units/useSkillTagSearch', () => ({
  useSkillTagSearch: (...args: unknown[]) => {
    skillTagSearchSpy(...args);
    return { addTagBackToSuggestions };
  },
}));

const porTag = { key: 'Vocabulary-1', name: 'por' } as SkillTag;
const porqueTag = { key: 'Vocabulary-99', name: 'porque' } as SkillTag;

describe('useCustomQuizFilterState', () => {
  beforeEach(() => {
    filters.excludeSpanglish = true;
    filters.audioOnly = false;
    filters.tagSearchTerm = 'por';
    filters.tagSuggestions = [porqueTag];
    filters.skillTags = [porTag];
  });

  it('exposes the spanglish, audio, and tag fields the quiz setup reads', () => {
    const { result, rerender } = renderHook(() => useCustomQuizFilterState());

    expect(combinedFiltersSpy).toHaveBeenCalledWith({});
    expect(skillTagSearchSpy).toHaveBeenCalledWith();
    expect(result.current.filterState.excludeSpanglish).toBe(true);
    expect(result.current.filterState.audioOnly).toBe(false);
    expect(result.current.filterState.tagSearchTerm).toBe('por');
    expect(result.current.filterState.tagSuggestions).toEqual([porqueTag]);
    expect(result.current.filterState.skillTags).toEqual([porTag]);
    expect(result.current.filterState.updateExcludeSpanglish).toBe(
      updateExcludeSpanglish,
    );
    expect(result.current.filterState.updateAudioOnly).toBe(updateAudioOnly);
    expect(result.current.filterState.updateTagSearchTerm).toBe(
      updateTagSearchTerm,
    );
    expect(result.current.filterState.addSkillTagToFilters).toBe(
      addSkillTagToFilters,
    );
    expect(result.current.filterState.removeTagFromSuggestions).toBe(
      removeTagFromSuggestions,
    );

    filters.excludeSpanglish = false;
    filters.audioOnly = true;
    filters.tagSearchTerm = 'que';
    filters.tagSuggestions = [porTag];
    filters.skillTags = [porqueTag];
    rerender();

    expect(result.current.filterState.excludeSpanglish).toBe(false);
    expect(result.current.filterState.audioOnly).toBe(true);
    expect(result.current.filterState.tagSearchTerm).toBe('que');
    expect(result.current.filterState.tagSuggestions).toEqual([porTag]);
    expect(result.current.filterState.skillTags).toEqual([porqueTag]);
  });

  it('forwards filter updates and puts a removed tag back into suggestions', () => {
    const { result } = renderHook(() => useCustomQuizFilterState());

    act(() => {
      result.current.filterState.updateExcludeSpanglish(false);
      result.current.filterState.updateAudioOnly(true);
      result.current.filterState.addSkillTagToFilters('Vocabulary-1');
    });

    expect(updateExcludeSpanglish).toHaveBeenCalledWith(false);
    expect(updateAudioOnly).toHaveBeenCalledWith(true);
    expect(addSkillTagToFilters).toHaveBeenCalledWith('Vocabulary-1');
    expect(addTagBackToSuggestions).not.toHaveBeenCalled();

    act(() => {
      result.current.filterState.removeSkillTagFromFilters('Vocabulary-1');
    });

    expect(removeSkillTagFromFilters).toHaveBeenCalledWith('Vocabulary-1');
    expect(addTagBackToSuggestions).toHaveBeenCalledTimes(1);
    expect(addTagBackToSuggestions).toHaveBeenCalledWith('Vocabulary-1');
  });
});
