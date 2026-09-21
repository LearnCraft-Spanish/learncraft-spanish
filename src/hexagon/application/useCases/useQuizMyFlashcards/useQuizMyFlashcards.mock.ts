import type { AudioQuizProps } from '@application/units/AudioQuiz/useAudioQuiz';
import type { UseCombinedFiltersWithVocabularyReturnType } from '@application/units/Filtering/useCombinedFiltersWithVocabulary';
import type { AudioQuizSetupReturn } from '@application/units/useAudioQuizSetup';
import type { UseTextQuizProps } from '@application/units/useTextQuiz';
import type { TextQuizSetupReturn } from '@application/units/useTextQuizSetup';
import type {
  UseQuizMyFlashcardsProps,
  UseQuizMyFlashcardsReturn,
} from '@application/useCases/useQuizMyFlashcards/useQuizMyFlashcards';
import type { SkillTag } from '@learncraft-spanish/shared';
import { PreSetQuizPreset } from '@application/units/Filtering/FilterPresets/preSetQuizzes';
import { MyFlashcardsQuizType } from '@application/useCases/useQuizMyFlashcards/useQuizMyFlashcards';
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

export const defaultMockExampleFilter: UseCombinedFiltersWithVocabularyReturnType =
  {
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
    excludeSpanglish: false,
    updateExcludeSpanglish: vi.fn<(value: boolean) => void>(),
    audioOnly: false,
    updateAudioOnly: vi.fn<(value: boolean) => void>(),
    includeUnpublished: false,
    updateIncludeUnpublished: vi.fn<(value: boolean) => void>(),
    isAdmin: false,
    isLoading: false,
    error: null,
  } as unknown as UseCombinedFiltersWithVocabularyReturnType;

export const defaultMockTextQuizSetup: TextQuizSetupReturn = {
  availableQuizLengths: [10, 20, 50],
  quizLength: 20,
  setSelectedQuizLength: vi.fn<(selectedQuizLength: number) => void>(),
  canAccessSRS: true,
  srsQuiz: false,
  setSrsQuiz: vi.fn<(srsQuiz: boolean) => void>(),
  startWithSpanish: false,
  setStartWithSpanish: vi.fn<(startWithSpanish: boolean) => void>(),
  canAccessCustom: true,
  customFlashcardsChoice: 'included',
  setCustomFlashcardsChoice:
    vi.fn<
      (customFlashcardsChoice: 'included' | 'onlyCustom' | 'excluded') => void
    >(),
  examplesToQuiz: [],
  isLoading: false,
  error: null,
  totalCount: 42,
};

export const defaultMockAudioQuizSetup: AudioQuizSetupReturn = {
  availableQuizLengths: [10, 20, 50],
  selectedQuizLength: 20,
  setSelectedQuizLength: vi.fn<(selectedQuizLength: number) => void>(),
  totalExamples: 42,
  audioQuizType: AudioQuizType.Speaking,
  setAudioQuizType: vi.fn<(audioQuizType: AudioQuizType) => void>(),
  autoplay: true,
  setAutoplay: vi.fn<(autoplay: boolean) => void>(),
};

export const defaultMockUseQuizMyFlashcards: UseQuizMyFlashcardsReturn = {
  audioQuizSetup: defaultMockAudioQuizSetup,
  textQuizSetup: defaultMockTextQuizSetup,

  exampleFilter: defaultMockExampleFilter,
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

  filterOwnedFlashcards: false,
  setFilterOwnedFlashcards: vi.fn<(filterOwnedFlashcards: boolean) => void>(),
  resetFilters: vi.fn<() => void>(),
  quizType: MyFlashcardsQuizType.Text,
  setQuizType: vi.fn<(quizType: MyFlashcardsQuizType) => void>(),
  isAudioQuiz: false,
  quizReady: false,
  quizNotReady: false,
  readyQuiz: vi.fn<() => void>(),
  cleanupQuiz: vi.fn<() => void>(),
  noFlashcards: false,

  countLabel: '42 flashcards found',
  ctaLabel: 'Quiz 20 flashcards',

  isLoading: false,
  error: null,
  isLoadingExamples: false,
  totalCount: 42,
};

export const {
  mock: mockUseQuizMyFlashcards,
  override: overrideMockUseQuizMyFlashcards,
  reset: resetMockUseQuizMyFlashcards,
} = createOverrideableMockHook<
  [UseQuizMyFlashcardsProps?],
  UseQuizMyFlashcardsReturn
>(defaultMockUseQuizMyFlashcards);

export default mockUseQuizMyFlashcards;
