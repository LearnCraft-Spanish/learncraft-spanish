import type { HomeCta, HomePresetEntry } from '@domain/homePresets/types';
import type { HomeView } from '@domain/studentAccess';
import { useAuthAdapter } from '@application/adapters/authAdapter';
import { useUsingAsStudent } from '@application/coordinators/hooks/useUsingAsStudent';
import {
  homeCtasForView,
  homeEntriesForView,
} from '@domain/homePresets/homePresets';
import { resolveHomeView } from '@domain/studentAccess';

export interface UseHomeViewResult {
  view: HomeView;
  showAdminTools: boolean;
  /** The limited and free homes' CTAs. Empty for other views. */
  ctas: readonly HomeCta[];
  /** The limited and free homes' regular menu options. Empty for other views. */
  entries: readonly HomePresetEntry[];
}

/** Which home `/` renders: student, staff tools, limited, or free. */
export function useHomeView(): UseHomeViewResult {
  const { isAdmin, isCoach, isStudent, isLimited } = useAuthAdapter();
  const { isUsingAsStudent } = useUsingAsStudent();

  const view = resolveHomeView({
    isStaff: isAdmin || isCoach,
    isUsingAsStudent,
    isStudent,
    isLimited,
  });

  return {
    view,
    showAdminTools: isAdmin,
    ctas: homeCtasForView(view),
    entries: homeEntriesForView(view),
  };
}
