import type {
  ActiveCourseAndLesson,
  HomePreset,
} from '@domain/homePresets/types';

const SUGGESTED_TOOL_EYEBROW = "Today's suggested tool";

/**
 * Fallback when the student's course/lesson matches no configured preset.
 * Reproduces today's desktop HomeV2 content so non-LCSP and unmatched
 * students still see a sensible screen.
 */
export const DEFAULT_HOME_PRESET: HomePreset = {
  label: 'Default',
  courseId: 0,
  fromLessonNumber: 0,
  toLessonNumber: null,
  cta: {
    headline: 'Quiz my flashcards',
    eyebrow: SUGGESTED_TOOL_EYEBROW,
    path: '/myflashcards',
  },
  entries: [
    {
      icon: 'cards',
      title: 'My flashcards',
      meta: 'Review and manage your saved cards',
      path: '/manage-flashcards',
    },
    {
      icon: 'trophy',
      title: 'Official quizzes',
      meta: 'Test yourself against a lesson quiz',
      path: '/officialquizzes',
    },
    {
      icon: 'search',
      title: 'Flashcard Finder',
      meta: 'Search the full course catalog',
      path: '/flashcardfinder',
    },
  ],
};

/**
 * Course- and lesson-scoped home screen presets.
 * courseId 2 = LearnCraft Spanish.
 */
export const HOME_PRESETS: readonly HomePreset[] = [
  {
    label: 'LCSP Official Quiz',
    courseId: 2, // LearnCraft Spanish
    fromLessonNumber: 1,
    toLessonNumber: 10,
    cta: {
      headline: 'Official Quiz',
      eyebrow: SUGGESTED_TOOL_EYEBROW,
      path: '/officialquizzes',
    },
    entries: [
      {
        icon: 'brain',
        title: 'Quiz my flashcards',
        meta: "Review the cards you've saved",
        path: '/myflashcards',
      },
      {
        icon: 'checklist',
        title: 'Custom quiz',
        meta: 'Build a quiz from any lesson range',
        path: '/customquiz',
      },
      {
        icon: 'search',
        title: 'Flashcard Finder',
        meta: 'Search the full course catalog',
        path: '/flashcardfinder',
      },
    ],
  },
  {
    label: 'LCSP Quiz My Flashcards',
    courseId: 2, // LearnCraft Spanish
    fromLessonNumber: 11,
    toLessonNumber: 24,
    cta: {
      headline: 'Quiz my flashcards',
      eyebrow: SUGGESTED_TOOL_EYEBROW,
      path: '/myflashcards',
    },
    entries: [
      {
        icon: 'trophy',
        title: 'Official quizzes',
        meta: 'Test yourself against a lesson quiz',
        path: '/officialquizzes',
      },
      {
        icon: 'cards',
        title: 'My flashcards',
        meta: 'Review and manage your saved cards',
        path: '/manage-flashcards',
      },
      {
        icon: 'search',
        title: 'Flashcard Finder',
        meta: 'Search the full course catalog',
        path: '/flashcardfinder',
      },
    ],
  },
  {
    label: 'LCSP Custom Quiz',
    courseId: 2, // LearnCraft Spanish
    fromLessonNumber: 25,
    toLessonNumber: null,
    cta: {
      headline: 'Build a Custom Quiz',
      eyebrow: SUGGESTED_TOOL_EYEBROW,
      path: '/customquiz',
    },
    entries: [
      {
        icon: 'trophy',
        title: 'Official quizzes',
        meta: 'Test yourself against a lesson quiz',
        path: '/officialquizzes',
      },
      {
        icon: 'brain',
        title: 'Quiz my flashcards',
        meta: "Review the cards you've saved",
        path: '/myflashcards',
      },
      {
        icon: 'search',
        title: 'Flashcard Finder',
        meta: 'Search the full course catalog',
        path: '/flashcardfinder',
      },
    ],
  },
];

function presetMatchesLesson(
  preset: HomePreset,
  lessonNumber: number,
): boolean {
  if (lessonNumber < preset.fromLessonNumber) {
    return false;
  }
  if (preset.toLessonNumber === null) {
    return true;
  }
  return lessonNumber <= preset.toLessonNumber;
}

/**
 * Picks the first preset whose course and inclusive lesson range match.
 * `toLessonNumber: null` is treated as unbounded. Falls back to
 * `DEFAULT_HOME_PRESET` when course/lesson are missing or no preset matches.
 */
export function selectHomePreset(active: ActiveCourseAndLesson): HomePreset {
  const { courseId, lessonNumber } = active;
  if (courseId === null || lessonNumber === null) {
    return DEFAULT_HOME_PRESET;
  }

  const match = HOME_PRESETS.find(
    (preset) =>
      preset.courseId === courseId && presetMatchesLesson(preset, lessonNumber),
  );

  return match ?? DEFAULT_HOME_PRESET;
}
