import type { AudioQuizProps } from '@application/units/AudioQuiz/useAudioQuiz';
import type { UseLimitedAudioQuizV2Return } from '@application/useCases/useLimitedAudioQuizV2/useLimitedAudioQuizV2';
import { mockCourse } from '@application/useCases/useCustomQuizV2/useCustomQuizV2.mock';
import { AudioQuizType } from '@domain/audioQuizzing';
import { createOverrideableMockHook } from '@testing/utils/createOverrideableMockHook';
import { vi } from 'vitest';

export const defaultMockUseLimitedAudioQuizV2: UseLimitedAudioQuizV2Return = {
  lessonRange: {
    course: mockCourse,
    courseId: mockCourse.id,
    fromLesson: mockCourse.lessons[0],
    fromLessonNumber: 1,
    toLesson: mockCourse.lessons[2],
    toLessonNumber: 3,
    updateUserSelectedCourseId: vi.fn<(courseId: number) => void>(),
    updateFromLessonNumber: vi.fn<(lessonNumber: number) => void>(),
    updateToLessonNumber: vi.fn<(lessonNumber: number) => void>(),
    includeUnpublished: false,
    isLoading: false,
    error: null,
  },
  coursesWithLessons: [mockCourse],

  audioQuizType: AudioQuizType.Speaking,
  setAudioQuizType: vi.fn<(value: AudioQuizType) => void>(),
  autoplay: true,
  setAutoplay: vi.fn<(value: boolean) => void>(),

  quizLength: 20,
  setQuizLength: vi.fn<(value: number) => void>(),
  quizLengthOptions: [10, 20, 50, 100, 150],

  countLabel: '412 audio examples found',
  ctaLabel: 'Quiz 20 audio examples',

  isInitialLoading: false,
  error: null,

  quizReady: false,
  quizNotReady: false,
  readyQuiz: vi.fn<() => void>(),
  audioQuizProps: {
    examplesToQuiz: [],
    audioQuizType: AudioQuizType.Speaking,
    autoplay: true,
    ready: false,
    cleanupFunction: vi.fn<() => void>(),
    canCollect: false,
  } satisfies AudioQuizProps,
};

export const {
  mock: mockUseLimitedAudioQuizV2,
  override: overrideMockUseLimitedAudioQuizV2,
  reset: resetMockUseLimitedAudioQuizV2,
} = createOverrideableMockHook<[], UseLimitedAudioQuizV2Return>(
  defaultMockUseLimitedAudioQuizV2,
);

export default mockUseLimitedAudioQuizV2;
