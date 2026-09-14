import type { VocabInfo } from '@application/units/useVocabInfo';
import type { SkillTag, Vocabulary } from '@learncraft-spanish/shared';
import { useAllVocabulary } from '@application/queries/useAllVocabulary';
import { useSkillTagSearch } from '@application/units/useSkillTagSearch';
import { useVocabInfo } from '@application/units/useVocabInfo';
import { findVocabularyById } from '@domain/functions/findVocabularyById';
import {
  filterToVocabularyTags,
  vocabularyIdFromSkillTag,
} from '@domain/functions/vocabularySkillTags';
import { useCallback, useMemo, useState } from 'react';

export interface UseVocabLookupResult {
  tagSearchTerm: string;
  tagSuggestions: SkillTag[];
  updateTagSearchTerm: (target?: EventTarget & HTMLInputElement) => void;
  selectTag: (tag: SkillTag) => void;
  clearSelection: () => void;
  selectedVocabulary: Vocabulary | null;
  selectionLoading: boolean;
  /** Whether the detail panel/modal for `selectedVocabulary` is open. */
  panelOpen: boolean;
  /** Closes the panel without forgetting `selectedVocabulary` (search focus). */
  closePanel: () => void;
  /** Opens the panel if closed, closes it if open (clicking the word chip). */
  toggleWordPanel: () => void;
  vocabInfoHook: (vocab: Vocabulary) => VocabInfo;
  isLoading: boolean;
  error: Error | null;
}

/**
 * Vocab lookup page use case: search the skill-tag catalog for Vocabulary /
 * Idiom tags, resolve a selection to a full Vocabulary record, and expose
 * `useVocabInfo` for the detail panel — same pattern `useTextQuiz` uses.
 *
 * Tag search narrows to Vocabulary/Idiom tags via `filterTags` *before*
 * `useSkillTagSearch` ranks and limits results, so this stays on the same
 * sorting/filtering path Flashcard Finder and Manager use (`searchSkillTags`)
 * instead of losing matches to excluded tag types that would otherwise fill
 * up the suggestion limit first.
 *
 * There is no backend endpoint to fetch one vocabulary record by id, so
 * selection resolves against the full catalog from `useAllVocabulary`
 * (`findVocabularyById`) rather than a per-id fetch. Lesson lookup for the
 * resolved record still goes through `useVocabInfo` -- the same
 * `useLessonsByVocabulary` route the quiz Get Help screens use.
 *
 * `panelOpen` tracks the detail panel separately from `selectedVocabulary`:
 * refocusing the search bar closes the panel (`closePanel`) so the
 * suggestion sheet never renders behind it, but the result chip stays
 * mounted and clickable (`toggleWordPanel`) to reopen the same detail. Only
 * `selectTag` (a new pick) and `clearSelection` touch the underlying
 * selection.
 */
export function useVocabLookup(): UseVocabLookupResult {
  const {
    tagSearchTerm,
    tagSuggestions,
    updateTagSearchTerm,
    isLoading: searchLoading,
    error: searchError,
  } = useSkillTagSearch({ filterTags: filterToVocabularyTags });

  const [selectedVocabularyId, setSelectedVocabularyId] = useState<
    number | null
  >(null);
  // Independent of `selectedVocabularyId` so a search-bar refocus can hide
  // the detail panel without forgetting the last result -- the chip stays
  // clickable to reopen it (see `toggleWordPanel`).
  const [panelOpen, setPanelOpen] = useState(false);

  const {
    vocabulary: allVocabulary,
    loading: vocabularyLoading,
    error: vocabularyError,
  } = useAllVocabulary();

  const selectedVocabulary = useMemo(
    () => findVocabularyById(allVocabulary, selectedVocabularyId),
    [allVocabulary, selectedVocabularyId],
  );

  const selectTag = useCallback(
    (tag: SkillTag): void => {
      const vocabularyId = vocabularyIdFromSkillTag(tag);
      if (vocabularyId === null) {
        return;
      }
      setSelectedVocabularyId(vocabularyId);
      setPanelOpen(true);
      updateTagSearchTerm();
    },
    [updateTagSearchTerm],
  );

  const clearSelection = useCallback((): void => {
    setSelectedVocabularyId(null);
    setPanelOpen(false);
  }, []);

  const closePanel = useCallback((): void => {
    setPanelOpen(false);
  }, []);

  const toggleWordPanel = useCallback((): void => {
    setPanelOpen((open) => !open);
  }, []);

  const vocabInfoHook = useVocabInfo;

  const error = searchError ?? vocabularyError;

  return {
    tagSearchTerm,
    tagSuggestions,
    updateTagSearchTerm,
    selectTag,
    clearSelection,
    selectedVocabulary,
    selectionLoading: selectedVocabularyId !== null && vocabularyLoading,
    panelOpen,
    closePanel,
    toggleWordPanel,
    vocabInfoHook,
    isLoading: searchLoading,
    error,
  };
}

export default useVocabLookup;
