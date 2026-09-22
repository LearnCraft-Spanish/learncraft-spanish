import type { AudioQuizProps } from '@application/units/AudioQuiz/useAudioQuiz';
import type { UseCombinedFiltersReturnType } from '@application/units/Filtering/useCombinedFilters';
import type { UseTextQuizProps } from '@application/units/useTextQuiz/useTextQuiz';
import type { UseCustomQuizV2Return } from '@application/useCases/useCustomQuizV2/useCustomQuizV2';
import type { SkillTag } from '@learncraft-spanish/shared';
import { PreSetQuizPreset } from '@application/units/Filtering/FilterPresets/preSetQuizzes';
import { CustomQuizType } from '@application/useCases/useCustomQuizV2/useCustomQuizV2';
import { AudioQuizType } from '@domain/audioQuizzing';
import { createOverrideableMockHook } from '@testing/utils/createOverrideableMockHook';
import { vi } from 'vitest';

export const mockCourse = {
  id: 2,
  name: 'LearnCraft Spanish',
  published: true,
  lessons: [
    { id: 1, courseName: 'LearnCraft Spanish', lessonNumber: 1 },
    { id: 2, courseName: 'LearnCraft Spanish', lessonNumber: 2 },
    { id: 3, courseName: 'LearnCraft Spanish', lessonNumber: 3 },
  ],
};

export const defaultMockExampleFilter: UseCombinedFiltersReturnType = {
  course: mockCourse,
  courseId: mockCourse.id,
  fromLesson: mockCourse.lessons[0],
  fromLessonNumber: 1,
  toLesson: mockCourse.lessons[2],
  toLessonNumber: 3,
  updateUserSelectedCourseId: vi.fn<(courseId: number) => void>(),
  updateFromLessonNumber: vi.fn<(lessonNumber: number) => void>(),
  updateToLessonNumber: vi.fn<(lessonNumber: number) => void>(),
  coursesWithLessons: [mockCourse],
  selectedSkillTags: [] as SkillTag[],
  addSkillTagToFilters: vi.fn<(tagKey: string) => void>(),
  removeSkillTagFromFilters: vi.fn<(tagKey: string) => void>(),
  bulkUpdateSkillTagKeys: vi.fn<(tagKeys: string[]) => void>(),
  outOfRangeSkillTagKeys: [],
  skillTagSearch: {
    tagSearchTerm: '',
    tagSuggestions: [],
    updateTagSearchTerm:
      vi.fn<(target?: EventTarget & HTMLInputElement) => void>(),
    removeTagFromSuggestions: vi.fn<(tagId: string) => void>(),
    addTagBackToSuggestions: vi.fn<(tagId: string) => void>(),
    isLoading: false,
    error: null,
  },
  filterPreset: PreSetQuizPreset.None,
  setFilterPreset: vi.fn<(preset: PreSetQuizPreset) => void>(),
  excludeSpanglish: true,
  updateExcludeSpanglish: vi.fn<(value: boolean) => void>(),
  audioOnly: false,
  updateAudioOnly: vi.fn<(value: boolean) => void>(),
  includeUnpublished: false,
  updateIncludeUnpublished: vi.fn<(value: boolean) => void>(),
  isAdmin: false,
  isLoading: false,
  error: null,
} as unknown as UseCombinedFiltersReturnType;

export const defaultMockUseCustomQuizV2: UseCustomQuizV2Return = {
  exampleFilter: defaultMockExampleFilter,

  quizType: CustomQuizType.Flashcards,
  setQuizType: vi.fn<(type: CustomQuizType) => void>(),
  isAudioQuiz: false,

  startWithSpanish: false,
  setStartWithSpanish: vi.fn<(value: boolean) => void>(),

  audioQuizType: AudioQuizType.Speaking,
  setAudioQuizType: vi.fn<(value: AudioQuizType) => void>(),
  autoplay: true,
  setAutoplay: vi.fn<(value: boolean) => void>(),

  quizLength: 20,
  setQuizLength: vi.fn<(value: number) => void>(),
  quizLengthOptions: [10, 20, 50, 100, 150],

  totalCount: 6992,
  effectiveCount: 20,
  countLabel: '6,992 flashcards found',
  ctaLabel: 'Quiz 20 flashcards',
  fromLessonText: 'From lesson lcsp 1',
  selectedTagCount: 0,

  isLoadingExamples: false,
  isInitialLoading: false,
  error: null,

  quizReady: false,
  quizNotReady: false,
  readyQuiz: vi.fn<() => void>(),
  textQuizProps: {
    examples: [],
    startWithSpanish: false,
    cleanupFunction: vi.fn<() => void>(),
  } satisfies UseTextQuizProps,
  audioQuizProps: {
    examplesToQuiz: [],
    audioQuizType: AudioQuizType.Speaking,
    autoplay: true,
    ready: false,
    cleanupFunction: vi.fn<() => void>(),
  } satisfies AudioQuizProps,
};

export const {
  mock: mockUseCustomQuizV2,
  override: overrideMockUseCustomQuizV2,
  reset: resetMockUseCustomQuizV2,
} = createOverrideableMockHook<[], UseCustomQuizV2Return>(
  defaultMockUseCustomQuizV2,
);

export default mockUseCustomQuizV2;
