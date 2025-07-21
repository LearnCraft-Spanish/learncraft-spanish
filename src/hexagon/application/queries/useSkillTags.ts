import { useQuery } from '@tanstack/react-query';
import { useAuthAdapter } from '../adapters/authAdapter';
import { useSkillTagsAdapter } from '../adapters/skillTagsAdapter';
import { queryDefaults } from '../utils/queryUtils';

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
