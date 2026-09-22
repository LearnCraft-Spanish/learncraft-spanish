import type { HomePresetCta, HomePresetEntry } from '@domain/homePresets/types';
import { useActiveStudent } from '@application/coordinators/hooks/useActiveStudent';
import { useLastStudiedLessonQuery } from '@application/queries/useLastStudiedLessonQuery';
import {
  DEFAULT_HOME_PRESET,
  selectHomePreset,
} from '@domain/homePresets/homePresets';
import { resolveActiveCourseAndLesson } from '@domain/homePresets/resolveActiveCourseAndLesson';
import { useMemo } from 'react';

export interface UseHomeScreenReturn {
  cta: HomePresetCta;
  entries: readonly HomePresetEntry[];
  isLoading: boolean;
  error: Error | null;
}

/**
 * Student home screen use case: wait for the enrolled student's course and
 * last-studied lesson, then pick the matching home preset.
 *
 * Resolution is read-only — it never reads the session dropdown overrides in
 * `useSelectedCourseAndLessons`, so a filter change elsewhere cannot change
 * which home buttons appear. On error, the default preset is returned so the
 * home screen is never blank.
 */
export function useHomeScreen(): UseHomeScreenReturn {
  const {
    appUser,
    isLoading: appUserLoading,
    error: appUserError,
  } = useActiveStudent();
  const {
    lastStudiedLesson,
    isLoading: lastStudiedLoading,
    error: lastStudiedError,
  } = useLastStudiedLessonQuery();

  const isLoading = appUserLoading || lastStudiedLoading;
  const error = appUserError ?? lastStudiedError;

  const preset = useMemo(() => {
    if (error) {
      return DEFAULT_HOME_PRESET;
    }
    const active = resolveActiveCourseAndLesson({
      appUser,
      lastStudiedLesson,
    });
    return selectHomePreset(active);
  }, [appUser, lastStudiedLesson, error]);

  return {
    cta: preset.cta,
    entries: preset.entries,
    isLoading,
    error,
  };
}

export default useHomeScreen;
