import type { SkillTag } from '@learncraft-spanish/shared';
import { overrideMockSkillTagsAdapter } from '@application/adapters/skillTagsAdapter.mock';
import { overrideMockVocabularyAdapter } from '@application/adapters/vocabularyAdapter.mock';
import { useVocabLookup } from '@application/useCases/useVocabLookup';
import { SkillType } from '@learncraft-spanish/shared';
import { act, renderHook, waitFor } from '@testing-library/react';
import { createMockVocabulary } from '@testing/factories/vocabularyFactories';
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

const porVocabulary = createMockVocabulary({ id: 1, word: 'por' });
const porqueVocabulary = createMockVocabulary({ id: 99, word: 'porque' });

function renderLookup() {
  return renderHook(() => useVocabLookup(), {
    wrapper: createQueryClientWrapper(),
  });
}

describe('useVocabLookup', () => {
  beforeEach(() => {
    overrideMockSkillTagsAdapter({
      getSkillTags: async () => allTags,
    });
    overrideMockVocabularyAdapter({
      getVocabulary: async () => [porVocabulary, porqueVocabulary],
    });
  });

  it('suggests only Vocabulary and Idiom tags', async () => {
    const { result } = renderLookup();

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    act(() => {
      result.current.updateTagSearchTerm({
        value: 'po',
      } as EventTarget & HTMLInputElement);
    });

    await waitFor(() =>
      expect(result.current.tagSuggestions.map((tag) => tag.key)).toEqual([
        'Vocabulary-1',
        'Vocabulary-99',
      ]),
    );
  });

  it('keeps vocabulary matches even when many non-vocabulary tags would otherwise crowd them out', async () => {
    // Regression test: filtering to Vocabulary/Idiom tags must happen before
    // useSkillTagSearch ranks and limits results, otherwise structural tags
    // (sorted ahead of individual terms within a tier) fill the suggestion
    // limit and por/porque never make it into tagSuggestions.
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

    const { result } = renderLookup();

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    act(() => {
      result.current.updateTagSearchTerm({
        value: 'po',
      } as EventTarget & HTMLInputElement);
    });

    await waitFor(() =>
      expect(result.current.tagSuggestions.map((tag) => tag.key)).toEqual([
        'Vocabulary-1',
        'Vocabulary-99',
      ]),
    );
  });

  it('resolves a selected tag to a Vocabulary record and clears the search', async () => {
    const { result } = renderLookup();

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    act(() => {
      result.current.updateTagSearchTerm({
        value: 'por',
      } as EventTarget & HTMLInputElement);
    });

    await waitFor(() =>
      expect(result.current.tagSuggestions.length).toBeGreaterThan(0),
    );

    act(() => {
      result.current.selectTag(porTag);
    });

    expect(result.current.tagSearchTerm).toBe('');

    await waitFor(() => expect(result.current.selectedVocabulary?.id).toBe(1));
    expect(result.current.selectedVocabulary?.word).toBe('por');
  });

  it('ignores structural tags that somehow reach selectTag', async () => {
    const { result } = renderLookup();

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    act(() => {
      result.current.selectTag(ponerTag);
    });

    expect(result.current.selectedVocabulary).toBeNull();
  });

  it('clears the selection', async () => {
    const { result } = renderLookup();

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    act(() => {
      result.current.selectTag(porTag);
    });

    await waitFor(() =>
      expect(result.current.selectedVocabulary).not.toBeNull(),
    );

    act(() => {
      result.current.clearSelection();
    });

    expect(result.current.selectedVocabulary).toBeNull();
  });

  it('exposes useVocabInfo as vocabInfoHook', async () => {
    const { result } = renderLookup();

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(typeof result.current.vocabInfoHook).toBe('function');
  });
});
