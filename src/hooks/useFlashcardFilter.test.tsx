import { describe, expect, it } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import MockAllProviders from 'mocks/Providers/MockAllProviders';
import serverlikeData from 'mocks/data/serverlike/serverlikeData';
import useFlashcardFilter from './useFlashcardFilter';
// import type { Flashcard, VocabTag, Vocabulary } from '../interfaceDefinitions';
// import { useVocabulary } from './useVocabulary';

const { verifiedExamplesTable } = serverlikeData().api;

describe('useFlashcardFilter', () => {
  it('includeSpanglish is false', async () => {
    const { result } = renderHook(() => useFlashcardFilter(), {
      wrapper: MockAllProviders,
    });
    await waitFor(() =>
      expect(result.current.filterFlashcards).toBeInstanceOf(Function),
    );
    const filteredExamples = result.current.filterFlashcards({
      examples: verifiedExamplesTable,
      includeSpanglish: false,
      orTags: [],
    });
    await waitFor(() => expect(filteredExamples.length).toBeGreaterThan(0));
    expect(filteredExamples.length).toBeLessThan(verifiedExamplesTable.length);
    expect(filteredExamples.length).toBeGreaterThan(0);
    expect(filteredExamples[0].spanglish).toBe('esp');
  });

  it('includeSpanglish is true', async () => {
    const { result } = renderHook(() => useFlashcardFilter(), {
      wrapper: MockAllProviders,
    });
    await waitFor(() =>
      expect(result.current.filterFlashcards).toBeInstanceOf(Function),
    );
    const filteredExamples = result.current.filterFlashcards({
      examples: verifiedExamplesTable,
      includeSpanglish: true,
      orTags: [],
    });
    await waitFor(() => expect(filteredExamples.length).toBeGreaterThan(0));
    expect(filteredExamples.length).toBe(verifiedExamplesTable.length);
  });
});
