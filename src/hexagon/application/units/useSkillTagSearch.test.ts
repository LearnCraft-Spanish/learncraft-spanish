import type { SkillTag } from '@learncraft-spanish/shared';
import { overrideMockSkillTagsAdapter } from '@application/adapters/skillTagsAdapter.mock';
import { useSkillTagSearch } from '@application/units/useSkillTagSearch';
import { SkillType } from '@learncraft-spanish/shared';
import { act, renderHook, waitFor } from '@testing-library/react';
import { createQueryClientWrapper } from '@testing/providers/createQueryClientWrapper';
import { beforeEach, describe, expect, it } from 'vitest';

const porTag: SkillTag = {
  type: SkillType.Vocabulary,
  key: 'Vocabulary-1',
  name: 'por',
  descriptor: 'for',
  vocabularyId: 1,
  subcategoryName: 'Prepositions',
};

const porqueTag: SkillTag = {
  type: SkillType.Vocabulary,
  key: 'Vocabulary-99',
  name: 'porque',
  descriptor: 'because',
  vocabularyId: 99,
  subcategoryName: 'Conjunctions',
};

const ponerTag: SkillTag = {
  type: SkillType.Verb,
  key: 'Verb-7',
  name: 'poner',
  verbId: 7,
  verbTags: ['irregular'],
};

const allTags: SkillTag[] = [porTag, porqueTag, ponerTag];

function renderSearch(allowedVocabularyIds?: number[]) {
  return renderHook(() => useSkillTagSearch({ allowedVocabularyIds }), {
    wrapper: createQueryClientWrapper(),
  });
}

async function search(
  result: { current: ReturnType<typeof useSkillTagSearch> },
  term: string,
) {
  act(() => {
    result.current.updateTagSearchTerm({
      value: term,
    } as EventTarget & HTMLInputElement);
  });
}

describe('useSkillTagSearch', () => {
  beforeEach(() => {
    overrideMockSkillTagsAdapter({
      getSkillTags: async () => allTags,
    });
  });

  it('suggests every matching tag when no allowed vocabulary is given', async () => {
    const { result } = renderSearch();

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    await search(result, 'po');

    await waitFor(() =>
      expect(result.current.tagSuggestions.map((tag) => tag.key)).toEqual([
        'Vocabulary-1',
        'Vocabulary-99',
        'Verb-7',
      ]),
    );
  });

  it('withholds vocabulary tags outside the allowed vocabulary', async () => {
    const { result } = renderSearch([1]);

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    await search(result, 'po');

    await waitFor(() =>
      expect(result.current.tagSuggestions.map((tag) => tag.key)).toEqual([
        'Vocabulary-1',
        'Verb-7',
      ]),
    );
  });

  it('withholds every vocabulary tag when the allowed vocabulary is empty', async () => {
    const { result } = renderSearch([]);

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    await search(result, 'po');

    await waitFor(() =>
      expect(result.current.tagSuggestions.map((tag) => tag.key)).toEqual([
        'Verb-7',
      ]),
    );
  });

  it('returns no suggestions for an empty search term', async () => {
    const { result } = renderSearch([1]);

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.tagSuggestions).toEqual([]);
  });
});
