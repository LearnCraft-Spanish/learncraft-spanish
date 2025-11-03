import type { SkillTagsPort } from '@application/ports/skillTagsPort';
import { useAuthAdapter } from '@application/adapters/authAdapter';
import { config } from '@config';
import { createSkillTagsInfrastructure } from '@infrastructure/skillTagsInfrastructure';

export function useSkillTagsAdapter(): SkillTagsPort {
  const apiUrl = config.backendDomain;
  const auth = useAuthAdapter();
  return createSkillTagsInfrastructure(apiUrl, auth);
}
