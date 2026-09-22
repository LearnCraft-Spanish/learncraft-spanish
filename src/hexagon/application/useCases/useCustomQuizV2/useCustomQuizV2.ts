import type { AudioQuizProps } from '@application/units/AudioQuiz/useAudioQuiz';
import type { UseCombinedFiltersReturnType } from '@application/units/Filtering/useCombinedFilters';
import type { UseTextQuizProps } from '@application/units/useTextQuiz/useTextQuiz';
import type { ExampleWithVocabulary } from '@learncraft-spanish/shared';
import { useAudioAdapter } from '@application/adapters/audioAdapter';
import { useAuthAdapter } from '@application/adapters/authAdapter';
import { useExampleQuery } from '@application/queries/ExampleQueries/useExampleQuery';
import { useLastStudiedLessonQuery } from '@application/queries/useLastStudiedLessonQuery';
import { useCombinedFilters } from '@application/units/Filtering/useCombinedFilters';
import { AudioQuizType } from '@domain/audioQuizzing';
import {
  countLabel as buildCountLabel,
  ctaLabel as buildCtaLabel,
  fromLessonText as buildFromLessonText,
  effectiveQuizCount,
} from '@domain/functions/customQuizCopy';
import { fisherYatesShuffle } from '@domain/functions/fisherYatesShuffle';
import {
  availableQuizLengths,
  snapQuizLength,
} from '@domain/functions/quizLength';
import { useCallback, useMemo, useRef, useState } from 'react';
import silence1s from 'src/assets/audio/1s.mp3';

export enum CustomQuizType {
  Flashcards = 'flashcards',
  Audio = 'audio',
}

const DEFAULT_QUIZ_LENGTH = 20;
const QUERY_PAGE_SIZE = 150;

export interface UseCustomQuizV2Return {
  /** Course, lesson range, tags, presets and the filter toggles. */
  exampleFilter: UseCombinedFiltersReturnType;

  quizType: CustomQuizType;
  setQuizType: (type: CustomQuizType) => void;
  isAudioQuiz: boolean;

  startWithSpanish: boolean;
  setStartWithSpanish: (value: boolean) => void;

  /** Audio-only: whether the learner answers aloud or transcribes. */
  audioQuizType: AudioQuizType;
  setAudioQuizType: (value: AudioQuizType) => void;
  autoplay: boolean;
  setAutoplay: (value: boolean) => void;

  /** Always one of `quizLengthOptions`, or 0 when nothing is drawable. */
  quizLength: number;
  setQuizLength: (value: number) => void;
  /** The lengths the drawable set allows, smallest first. */
  quizLengthOptions: readonly number[];

  /** Total matching the current filters, not what the quiz will draw. */
  totalCount: number | null;
  /** What the quiz will actually draw: min(total, length). */
  effectiveCount: number;
  countLabel: string;
  ctaLabel: string;
  fromLessonText: string;
  selectedTagCount: number;

  isLoadingExamples: boolean;
  isInitialLoading: boolean;
  error: Error | null;

  quizReady: boolean;
  quizNotReady: boolean;
  readyQuiz: () => void;
  textQuizProps: UseTextQuizProps;
  audioQuizProps: AudioQuizProps;
}

export function useCustomQuizV2(): UseCustomQuizV2Return {
  const { primeAudioElement } = useAudioAdapter();
  const { isCoach, isAdmin } = useAuthAdapter();
  const { recordLastStudiedLesson } = useLastStudiedLessonQuery();

  const [quizType, setQuizType] = useState<CustomQuizType>(
    CustomQuizType.Flashcards,
  );
  const [startWithSpanish, setStartWithSpanish] = useState(false);
  const [audioQuizType, setAudioQuizType] = useState<AudioQuizType>(
    AudioQuizType.Speaking,
  );
  const [autoplay, setAutoplay] = useState(true);
  const [selectedQuizLength, setQuizLength] =
    useState<number>(DEFAULT_QUIZ_LENGTH);
  const [quizReady, setQuizReady] = useState(false);

  const staticExamples = useRef<ExampleWithVocabulary[]>([]);
  const hasLoadedBefore = useRef(false);
  const lastQuizableCount = useRef(0);

  const isAudioQuiz = quizType === CustomQuizType.Audio;

  const exampleFilter: UseCombinedFiltersReturnType = useCombinedFilters({});

  const {
    isDependenciesLoading,
    filteredExamples,
    isLoading: isLoadingExamples,
    totalCount,
    error: errorExamples,
  } = useExampleQuery(QUERY_PAGE_SIZE, isAudioQuiz, isCoach || isAdmin);

  if (totalCount !== null) {
    hasLoadedBefore.current = true;
  }

  const isInitialLoading =
    isDependenciesLoading || (isLoadingExamples && !hasLoadedBefore.current);

  // An audio quiz can only use examples that carry Spanish audio, so the
  // audio-required query is narrowed again here rather than trusted.
  const quizableExamples = useMemo((): ExampleWithVocabulary[] => {
    if (!filteredExamples) {
      return [];
    }
    if (!isAudioQuiz) {
      return filteredExamples;
    }
    return filteredExamples.filter(
      (example) => example.spanishAudio?.length > 0,
    );
  }, [filteredExamples, isAudioQuiz]);

  // The quiz draws from the loaded page, so that is what the lengths are built
  // from. A filter change in flight would otherwise empty the options for a
  // moment, so the last loaded count stands in until the new one arrives.
  if (filteredExamples !== null) {
    lastQuizableCount.current = quizableExamples.length;
  }
  const quizableCount = lastQuizableCount.current;

  const quizLengthOptions = useMemo(
    () => availableQuizLengths(quizableCount),
    [quizableCount],
  );

  const quizLength = snapQuizLength(selectedQuizLength, quizLengthOptions);

  const count = totalCount ?? 0;
  const effectiveCount = effectiveQuizCount(count, quizLength);

  const readyQuiz = useCallback((): void => {
    const { course, toLesson } = exampleFilter;
    if (course && toLesson) {
      void recordLastStudiedLesson({
        courseId: course.id,
        lessonNumber: toLesson.lessonNumber,
      });
    }

    if (isAudioQuiz) {
      primeAudioElement(silence1s);
    }

    staticExamples.current = fisherYatesShuffle(quizableExamples).slice(
      0,
      quizLength,
    );
    setQuizReady(true);
  }, [
    exampleFilter,
    recordLastStudiedLesson,
    quizLength,
    quizableExamples,
    isAudioQuiz,
    primeAudioElement,
  ]);

  const cleanupQuiz = useCallback((): void => {
    staticExamples.current = [];
    setQuizReady(false);
  }, []);

  const textQuizProps: UseTextQuizProps = {
    examples: quizReady ? staticExamples.current : [],
    startWithSpanish,
    cleanupFunction: cleanupQuiz,
  };

  const audioQuizProps: AudioQuizProps = {
    examplesToQuiz: quizReady ? staticExamples.current : [],
    audioQuizType,
    autoplay,
    ready: quizReady,
    cleanupFunction: cleanupQuiz,
  };

  return {
    exampleFilter,

    quizType,
    setQuizType,
    isAudioQuiz,

    startWithSpanish,
    setStartWithSpanish,

    audioQuizType,
    setAudioQuizType,
    autoplay,
    setAutoplay,

    quizLength,
    setQuizLength,
    quizLengthOptions,

    totalCount,
    effectiveCount,
    countLabel: buildCountLabel(count, isAudioQuiz),
    ctaLabel: buildCtaLabel(count, quizLength, isAudioQuiz),
    fromLessonText: buildFromLessonText(
      exampleFilter.course?.name ?? null,
      exampleFilter.fromLessonNumber,
    ),
    selectedTagCount: exampleFilter.selectedSkillTags.length,

    isLoadingExamples,
    isInitialLoading,
    error: errorExamples ?? exampleFilter.error,

    quizReady,
    quizNotReady: isLoadingExamples || effectiveCount === 0,
    readyQuiz,
    textQuizProps,
    audioQuizProps,
  };
}

export default useCustomQuizV2;
