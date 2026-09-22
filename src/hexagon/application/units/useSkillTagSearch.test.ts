import type { ReachableSkills, SkillTag } from '@learncraft-spanish/shared';
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
  frequency: 10,
};

const porqueTag: SkillTag = {
  type: SkillType.Vocabulary,
  key: 'Vocabulary-99',
  name: 'porque',
  descriptor: 'because',
  vocabularyId: 99,
  subcategoryName: 'Conjunctions',
  frequency: 20,
};

const ponerTag: SkillTag = {
  type: SkillType.Verb,
  key: 'Verb-7',
  name: 'poner',
  verbId: 7,
  verbTags: ['irregular'],
};

const allTags: SkillTag[] = [porTag, porqueTag, ponerTag];

const nothingReachable: ReachableSkills = {
  vocabularyIds: [],
  subcategoryIds: [],
  verbIds: [],
  conjugationTags: [],
};

function renderSearch(reachableSkills?: Partial<ReachableSkills>) {
  return renderHook(
    () =>
      useSkillTagSearch({
        reachableSkills: reachableSkills
          ? { ...nothingReachable, ...reachableSkills }
          : undefined,
      }),
    {
      wrapper: createQueryClientWrapper(),
    },
  );
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

  it('suggests every matching tag when no reachable skills are given', async () => {
    const { result } = renderSearch();

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    await search(result, 'po');

    await waitFor(() =>
      expect(result.current.tagSuggestions.map((tag) => tag.key)).toEqual([
        'Verb-7',
        'Vocabulary-1',
        'Vocabulary-99',
      ]),
    );
  });

  it('withholds vocabulary tags the lesson range cannot reach', async () => {
    const { result } = renderSearch({ vocabularyIds: [1], verbIds: [7] });

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    await search(result, 'po');

    await waitFor(() =>
      expect(result.current.tagSuggestions.map((tag) => tag.key)).toEqual([
        'Verb-7',
        'Vocabulary-1',
      ]),
    );
  });

  it('withholds verb tags the lesson range cannot reach', async () => {
    const { result } = renderSearch({ vocabularyIds: [1, 99] });

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    await search(result, 'po');

    await waitFor(() =>
      expect(result.current.tagSuggestions.map((tag) => tag.key)).toEqual([
        'Vocabulary-1',
        'Vocabulary-99',
      ]),
    );
  });

  it('narrows the catalog with filterTags before ranking, so filtered-out tags cannot crowd out matches', async () => {
    // Without a pre-filter, 25 structural (Verb) tags matching "po" would
    // sort ahead of por/porque (structural tags rank before individual
    // terms within a tier) and fill SUGGESTION_LIMIT before a post-hoc type
    // filter ever ran. filterTags must be applied before ranking/limiting.
    const manyVerbTags: SkillTag[] = Array.from({ length: 25 }, (_, i) => ({
      type: SkillType.Verb,
      key: `Verb-po-${i}`,
      name: `po-verb-${i}`,
      verbId: i + 1,
      verbTags: [],
    }));

    overrideMockSkillTagsAdapter({
      getSkillTags: async () => [...manyVerbTags, porTag, porqueTag],
    });

    const { result } = renderHook(
      () =>
        useSkillTagSearch({
          filterTags: (tags) =>
            tags.filter((tag) => tag.type === SkillType.Vocabulary),
        }),
      { wrapper: createQueryClientWrapper() },
    );

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    await search(result, 'po');

    await waitFor(() =>
      expect(result.current.tagSuggestions.map((tag) => tag.key)).toEqual([
        'Vocabulary-1',
        'Vocabulary-99',
      ]),
    );
  });

  it('withholds every tag when the lesson range reaches nothing', async () => {
    const { result } = renderSearch(nothingReachable);

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    await search(result, 'po');

    await waitFor(() => expect(result.current.tagSuggestions).toEqual([]));
  });

  it('returns no suggestions for an empty search term', async () => {
    const { result } = renderSearch({ vocabularyIds: [1] });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.tagSuggestions).toEqual([]);
  });

  it('withholds a removed tag until it is added back', async () => {
    const { result } = renderSearch();

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    await search(result, 'po');

    await waitFor(() => expect(result.current.tagSuggestions).toHaveLength(3));

    act(() => result.current.removeTagFromSuggestions('Vocabulary-1'));

    await waitFor(() =>
      expect(result.current.tagSuggestions.map((tag) => tag.key)).toEqual([
        'Verb-7',
        'Vocabulary-99',
      ]),
    );

    act(() => result.current.addTagBackToSuggestions('Vocabulary-1'));

    await waitFor(() =>
      expect(result.current.tagSuggestions.map((tag) => tag.key)).toEqual([
        'Verb-7',
        'Vocabulary-1',
        'Vocabulary-99',
      ]),
    );
  });

  it('surfaces a tag catalog failure', async () => {
    overrideMockSkillTagsAdapter({
      getSkillTags: async () => {
        throw new Error('catalog unavailable');
      },
    });

    const { result } = renderSearch();

    await waitFor(() => expect(result.current.error).not.toBeNull());
    expect(result.current.tagSuggestions).toEqual([]);
  });
});
