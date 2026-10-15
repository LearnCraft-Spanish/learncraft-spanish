import type { UseSelectedCourseAndLessonsReturnType } from '@application/coordinators/hooks/types';
import type { AudioQuizProps } from '@application/units/AudioQuiz/useAudioQuiz';
import type {
  CourseWithLessons,
  ExampleWithVocabulary,
} from '@learncraft-spanish/shared';
import { useAudioAdapter } from '@application/adapters/audioAdapter';
import { useSelectedCourseAndLessons } from '@application/coordinators/hooks/useSelectedCourseAndLessons';
import { useExampleQuery } from '@application/queries/ExampleQueries/useExampleQuery';
import { useCoursesWithLessons } from '@application/queries/useCoursesWithLessons';
import { useLastStudiedLessonQuery } from '@application/queries/useLastStudiedLessonQuery';
import { AudioQuizType } from '@domain/audioQuizzing';
import {
  countLabel as buildCountLabel,
  ctaLabel as buildCtaLabel,
  effectiveQuizCount,
} from '@domain/functions/customQuizCopy';
import { fisherYatesShuffle } from '@domain/functions/fisherYatesShuffle';
import {
  availableQuizLengths,
  snapQuizLength,
} from '@domain/functions/quizLength';
import { useCallback, useMemo, useRef, useState } from 'react';
import silence1s from 'src/assets/audio/1s.mp3';

const DEFAULT_QUIZ_LENGTH = 20;
const QUERY_PAGE_SIZE = 150;

export interface UseLimitedAudioQuizV2Return {
  /** The selected course and lesson range, shared with the rest of the app. */
  lessonRange: UseSelectedCourseAndLessonsReturnType;
  /** Catalog for the course picker. */
  coursesWithLessons: CourseWithLessons[] | undefined;

  audioQuizType: AudioQuizType;
  setAudioQuizType: (value: AudioQuizType) => void;
  autoplay: boolean;
  setAutoplay: (value: boolean) => void;

  /** Always one of `quizLengthOptions`, or 0 when nothing is drawable. */
  quizLength: number;
  setQuizLength: (value: number) => void;
  quizLengthOptions: readonly number[];

  countLabel: string;
  ctaLabel: string;

  isInitialLoading: boolean;
  error: Error | null;

  quizReady: boolean;
  quizNotReady: boolean;
  readyQuiz: () => void;
  audioQuizProps: AudioQuizProps;
}

/**
 * The v2 audio quiz for limited users: a lesson range plus the audio
 * options, with no flashcard quiz type and no tags. Limited users have no
 * flashcards of their own, so the quiz never offers to collect any.
 */
export function useLimitedAudioQuizV2(): UseLimitedAudioQuizV2Return {
  const { primeAudioElement } = useAudioAdapter();
  const lessonRange = useSelectedCourseAndLessons();
  const { data: coursesWithLessons } = useCoursesWithLessons(false);
  const { recordLastStudiedLesson } = useLastStudiedLessonQuery();

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

  const {
    isDependenciesLoading,
    filteredExamples,
    isLoading: isLoadingExamples,
    totalCount,
    error,
  } = useExampleQuery(QUERY_PAGE_SIZE, true);

  if (totalCount !== null) {
    hasLoadedBefore.current = true;
  }

  const isInitialLoading =
    isDependenciesLoading || (isLoadingExamples && !hasLoadedBefore.current);

  // The audio-required query is narrowed again here rather than trusted,
  // since a quiz example without Spanish audio cannot be played.
  const quizableExamples = useMemo(
    (): ExampleWithVocabulary[] =>
      (filteredExamples ?? []).filter(
        (example) => example.spanishAudio?.length > 0,
      ),
    [filteredExamples],
  );

  // A lesson change in flight would otherwise empty the length options for a
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

  const { course, toLesson } = lessonRange;

  const readyQuiz = useCallback((): void => {
    if (course && toLesson) {
      void recordLastStudiedLesson({
        courseId: course.id,
        lessonNumber: toLesson.lessonNumber,
      });
    }
    primeAudioElement(silence1s);
    staticExamples.current = fisherYatesShuffle(quizableExamples).slice(
      0,
      quizLength,
    );
    setQuizReady(true);
  }, [
    course,
    toLesson,
    recordLastStudiedLesson,
    primeAudioElement,
    quizableExamples,
    quizLength,
  ]);

  const cleanupQuiz = useCallback((): void => {
    staticExamples.current = [];
    setQuizReady(false);
  }, []);

  return {
    lessonRange,
    coursesWithLessons,

    audioQuizType,
    setAudioQuizType,
    autoplay,
    setAutoplay,

    quizLength,
    setQuizLength,
    quizLengthOptions,

    countLabel: buildCountLabel(count, true),
    ctaLabel: buildCtaLabel(count, quizLength, true),

    isInitialLoading,
    error: error ?? lessonRange.error,

    quizReady,
    quizNotReady: isLoadingExamples || effectiveCount === 0,
    readyQuiz,
    audioQuizProps: {
      examplesToQuiz: quizReady ? staticExamples.current : [],
      audioQuizType,
      autoplay,
      ready: quizReady,
      cleanupFunction: cleanupQuiz,
      canCollect: false,
    },
  };
}

export default useLimitedAudioQuizV2;
