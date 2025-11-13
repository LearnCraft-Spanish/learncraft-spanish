import { useAuthAdapter } from '@application/adapters/authAdapter';
import { useSkillTagsAdapter } from '@application/adapters/skillTagsAdapter';
import { queryDefaults } from '@application/utils/queryUtils';
import { useQuery } from '@tanstack/react-query';

export function useSkillTags() {
  const skillTagsAdapter = useSkillTagsAdapter();
  const { isStudent, isAdmin, isCoach } = useAuthAdapter();
  const {
    data: skillTags,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['skillTags'],
    queryFn: () => {
      return skillTagsAdapter.getSkillTags();
    },
    enabled: isStudent || isAdmin || isCoach,
    ...queryDefaults,
  });

  return {
    skillTags,
    isLoading,
    error,
  };
}
