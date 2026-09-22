import type { VocabInfo } from '@application/units/useVocabInfo';
import type { UseVocabLookupResult } from '@application/useCases/useVocabLookup/useVocabLookup';
import type { SkillTag, Vocabulary } from '@learncraft-spanish/shared';
import { createOverrideableMockHook } from '@testing/utils/createOverrideableMockHook';
import { vi } from 'vitest';

const defaultVocabInfoHook = vi.fn<(vocab: Vocabulary) => VocabInfo>(
  (vocab) => ({
    word: vocab.word,
    descriptor: vocab.descriptor,
    subcategory: vocab.subcategory,
    verb: vocab.type === 'verb' ? vocab.verb : null,
    conjugationTags: vocab.type === 'verb' ? vocab.conjugationTags : null,
    lessons: [],
    lessonsLoading: false,
    currentCourseName: null,
  }),
);

export const defaultMockUseVocabLookup: UseVocabLookupResult = {
  tagSearchTerm: '',
  tagSuggestions: [],
  updateTagSearchTerm:
    vi.fn<(target?: EventTarget & HTMLInputElement) => void>(),
  selectTag: vi.fn<(tag: SkillTag) => void>(),
  clearSelection: vi.fn<() => void>(),
  selectedVocabulary: null,
  selectionLoading: false,
  panelOpen: true,
  closePanel: vi.fn<() => void>(),
  toggleWordPanel: vi.fn<() => void>(),
  vocabInfoHook: defaultVocabInfoHook,
  isLoading: false,
  error: null,
};

export const {
  mock: mockUseVocabLookup,
  override: overrideMockUseVocabLookup,
  reset: resetMockUseVocabLookup,
} = createOverrideableMockHook<[], UseVocabLookupResult>(
  defaultMockUseVocabLookup,
);

export default mockUseVocabLookup;
