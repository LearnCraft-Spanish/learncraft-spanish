/**
 * Domain types for the student home-screen preset system.
 *
 * `HomePresetIcon` is a narrow union of icon names the home screen may use.
 * Domain cannot import `IconName` from the interface layer; type safety is
 * enforced where `HomeV2` passes `entry.icon` into `EntryCard`.
 */

export type HomePresetIcon =
  | 'cards'
  | 'search'
  | 'trophy'
  | 'checklist'
  | 'headphones'
  | 'brain'
  | 'book'
  | 'clipboard'
  | 'star'
  | 'volume'
  | 'language'
  | 'bolt';

export interface HomePresetCta {
  headline: string;
  eyebrow: string;
  path: string;
}

export interface HomePresetEntry {
  icon: HomePresetIcon;
  title: string;
  meta: string;
  path: string;
}

export interface HomePreset {
  label: string;
  courseId: number;
  fromLessonNumber: number;
  /** `null` is open-ended, for the top band of a course. */
  toLessonNumber: number | null;
  cta: HomePresetCta;
  entries: readonly HomePresetEntry[];
}

export interface ActiveCourseAndLesson {
  courseId: number | null;
  lessonNumber: number | null;
}
