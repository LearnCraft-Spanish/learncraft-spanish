import type { SkillTagsPort } from '../ports/skillTagsPort';
import { createSkillTagsInfrastructure } from '@infrastructure/skillTagsInfrastructure';
import { config } from 'src/hexagon/config';
import { useAuthAdapter } from './authAdapter';

export function useSkillTagsAdapter(): SkillTagsPort {
  const apiUrl = config.backendDomain;
  const auth = useAuthAdapter();
  return createSkillTagsInfrastructure(apiUrl, auth);
}
