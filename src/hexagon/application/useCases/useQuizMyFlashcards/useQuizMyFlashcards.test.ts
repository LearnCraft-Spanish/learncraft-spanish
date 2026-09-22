import type { UseCombinedFiltersWithVocabularyReturnType } from '@application/units/Filtering/useCombinedFiltersWithVocabulary';
import type { AudioQuizSetupReturn } from '@application/units/useAudioQuizSetup';
import type { TextQuizSetupReturn } from '@application/units/useTextQuizSetup';
import type { CourseWithLessons } from '@learncraft-spanish/shared';
import { PreSetQuizPreset } from '@application/units/Filtering/FilterPresets/preSetQuizzes';
import {
  MyFlashcardsQuizType,
  useQuizMyFlashcards,
} from '@application/useCases/useQuizMyFlashcards/useQuizMyFlashcards';
import { AudioQuizType } from '@domain/audioQuizzing';
import { act, renderHook } from '@testing-library/react';
import { createMockExampleWithVocabularyList } from '@testing/factories/exampleFactory';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const primeAudioElement = vi.fn();

let exampleFilter: UseCombinedFiltersWithVocabularyReturnType;
let textSetup: TextQuizSetupReturn;
let audioSetup: AudioQuizSetupReturn;
let filterError: Error | null;

vi.mock('@application/adapters/audioAdapter', () => ({
  useAudioAdapter: () => ({ primeAudioElement }),
}));

vi.mock('@application/units/Filtering/useFilterOwnedFlashcards', () => ({
  useFilterOwnedFlashcards: () => ({
    filteredFlashcards: [],
    studentFlashcardsLoading: false,
    error: filterError,
  }),
}));

vi.mock(
  '@application/units/Filtering/useCombinedFiltersWithVocabulary',
  () => ({
    useCombinedFiltersWithVocabulary: () => exampleFilter,
  }),
);

vi.mock('@application/units/useTextQuizSetup', () => ({
  useTextQuizSetup: () => textSetup,
}));

vi.mock('@application/units/useAudioQuizSetup', () => ({
  useAudioQuizSetup: () => audioSetup,
}));

vi.mock('@application/units/useSkillTagSearch', () => ({
  useSkillTagSearch: () => ({
    tagSearchTerm: '',
    tagSuggestions: [],
    updateTagSearchTerm: vi.fn(),
    removeTagFromSuggestions: vi.fn(),
    addTagBackToSuggestions: vi.fn(),
    isLoading: false,
    error: null,
  }),
}));

function createExampleFilter(
  course: CourseWithLessons | null,
): UseCombinedFiltersWithVocabularyReturnType {
  return {
    course,
    bulkUpdateSkillTagKeys: vi.fn<(skillTagKeys: string[]) => void>(),
    updateExcludeSpanglish: vi.fn<(excludeSpanglish: boolean) => void>(),
    updateAudioOnly: vi.fn<(audioOnly: boolean) => void>(),
    updateIncludeUnpublished: vi.fn<(includeUnpublished: boolean) => void>(),
    setFilterPreset: vi.fn<(preset: PreSetQuizPreset) => void>(),
    updateFromLessonNumber: vi.fn<(lessonNumber: number) => void>(),
    skillTagSearch: {
      updateTagSearchTerm:
        vi.fn<(target?: EventTarget & HTMLInputElement) => void>(),
    },
  } as unknown as UseCombinedFiltersWithVocabularyReturnType;
}

function createTextSetup(
  overrides: Partial<TextQuizSetupReturn> = {},
): TextQuizSetupReturn {
  return {
    availableQuizLengths: [20],
    quizLength: 20,
    setSelectedQuizLength: vi.fn(),
    canAccessSRS: false,
    srsQuiz: false,
    setSrsQuiz: vi.fn(),
    startWithSpanish: false,
    setStartWithSpanish: vi.fn(),
    canAccessCustom: false,
    customFlashcardsChoice: 'included',
    setCustomFlashcardsChoice: vi.fn(),
    examplesToQuiz: [],
    isLoading: false,
    error: null,
    totalCount: 1200,
    ...overrides,
  };
}

function createAudioSetup(
  overrides: Partial<AudioQuizSetupReturn> = {},
): AudioQuizSetupReturn {
  return {
    availableQuizLengths: [10],
    selectedQuizLength: 10,
    setSelectedQuizLength: vi.fn(),
    totalExamples: 4,
    audioQuizType: AudioQuizType.Speaking,
    setAudioQuizType: vi.fn(),
    autoplay: false,
    setAutoplay: vi.fn(),
    ...overrides,
  };
}

describe('useQuizMyFlashcards', () => {
  beforeEach(() => {
    exampleFilter = createExampleFilter(null);
    textSetup = createTextSetup();
    audioSetup = createAudioSetup();
    filterError = null;
    primeAudioElement.mockClear();
  });

  it('labels a text quiz with the match count and the number the quiz will draw', () => {
    const { result } = renderHook(() => useQuizMyFlashcards());

    expect(result.current.isAudioQuiz).toBe(false);
    expect(result.current.countLabel).toBe('1,200 flashcards found');
    expect(result.current.ctaLabel).toBe('Quiz 20 flashcards');
  });

  it('switches the labels when the quiz type is audio', () => {
    const { result } = renderHook(() => useQuizMyFlashcards());

    act(() => {
      result.current.setQuizType(MyFlashcardsQuizType.Audio);
    });

    expect(result.current.isAudioQuiz).toBe(true);
    expect(result.current.countLabel).toBe('4 audio examples found');
    expect(result.current.ctaLabel).toBe('Quiz 4 audio examples');
  });

  it('snaps a prerequisite course back to its virtual lesson', () => {
    exampleFilter = createExampleFilter({
      id: 7,
      name: 'Post-Podcast Lessons',
      published: true,
      lessons: [{ id: 1, lessonNumber: 4, courseName: 'Post-Podcast Lessons' }],
    });

    const { result } = renderHook(() => useQuizMyFlashcards());

    act(() => {
      result.current.resetFilters();
    });

    expect(exampleFilter.updateFromLessonNumber).toHaveBeenCalledWith(-7001);
    expect(exampleFilter.setFilterPreset).toHaveBeenCalledWith(
      PreSetQuizPreset.None,
    );
  });

  it('leaves the lesson range alone when the selected course has no lessons', () => {
    exampleFilter = createExampleFilter({
      id: 2,
      name: 'LearnCraft Spanish',
      published: true,
      lessons: [],
    });

    const { result } = renderHook(() => useQuizMyFlashcards());

    act(() => {
      result.current.resetFilters();
    });

    expect(exampleFilter.updateFromLessonNumber).not.toHaveBeenCalled();
  });

  it('starts a text quiz with as many cards as the chosen length allows', () => {
    const examples = createMockExampleWithVocabularyList(3);
    textSetup = createTextSetup({
      examplesToQuiz: examples,
      quizLength: 2,
      totalCount: 3,
    });

    const { result } = renderHook(() => useQuizMyFlashcards());

    expect(result.current.quizNotReady).toBe(false);

    act(() => {
      result.current.readyQuiz();
    });

    expect(result.current.quizReady).toBe(true);
    expect(result.current.textQuizProps.examples).toHaveLength(2);
    expect(primeAudioElement).not.toHaveBeenCalled();
  });

  it('primes playback when an audio quiz starts', () => {
    audioSetup = createAudioSetup({ totalExamples: 4, selectedQuizLength: 2 });

    const { result } = renderHook(() => useQuizMyFlashcards());

    act(() => {
      result.current.setQuizType(MyFlashcardsQuizType.Audio);
    });
    act(() => {
      result.current.readyQuiz();
    });

    expect(result.current.quizReady).toBe(true);
    expect(primeAudioElement).toHaveBeenCalledOnce();
  });

  it('surfaces a flashcard-filter failure', () => {
    filterError = new Error('flashcards failed');

    const { result } = renderHook(() => useQuizMyFlashcards());

    expect(result.current.error).toEqual(new Error('flashcards failed'));
  });

  it('does not start an empty quiz, then starts once cards exist', () => {
    const examples = createMockExampleWithVocabularyList(3);
    textSetup = createTextSetup({
      examplesToQuiz: [],
      quizLength: 2,
      totalCount: 0,
    });

    const { result, rerender } = renderHook(() => useQuizMyFlashcards());

    act(() => {
      result.current.readyQuiz();
    });
    expect(result.current.quizReady).toBe(false);

    textSetup = createTextSetup({
      examplesToQuiz: examples,
      quizLength: 2,
      totalCount: 3,
    });
    rerender();

    act(() => {
      result.current.readyQuiz();
    });

    expect(result.current.quizReady).toBe(true);
    expect(result.current.textQuizProps.examples).toHaveLength(2);
  });
});
