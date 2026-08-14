import type { ReachableSkills } from '@learncraft-spanish/shared';
import { useSkillTagsAdapter } from '@application/adapters/skillTagsAdapter';
import { queryDefaults } from '@application/utils/queryUtils';
import { transformToLessonRanges } from '@domain/coursePrerequisites';
import { useQuery } from '@tanstack/react-query';

export interface UseReachableSkillsReturnType {
  reachableSkills: ReachableSkills | undefined;
  isLoading: boolean;
  error: Error | null;
}

/**
 * The skills a student can encounter in the selected lesson range, in the four
 * dimensions skill tags are identified by. Callers intersect these with the
 * full tag catalog rather than refetching tag records per range.
 */
export function useReachableSkills(
  courseId: number | null,
  fromLessonNumber: number | null,
  toLessonNumber: number | null,
  enabled: boolean = true,
): UseReachableSkillsReturnType {
  const skillTagsAdapter = useSkillTagsAdapter();

  const {
    data: reachableSkills,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['reachableSkills', courseId, fromLessonNumber, toLessonNumber],
    queryFn: () => {
      const lessonRanges = transformToLessonRanges({
        courseId,
        fromLessonNumber,
        toLessonNumber,
      });

      return skillTagsAdapter.getReachableSkills({ lessonRanges });
    },
    enabled: enabled && !!courseId && !!toLessonNumber,
    ...queryDefaults.referenceData,
  });

  return { reachableSkills, isLoading, error };
}
