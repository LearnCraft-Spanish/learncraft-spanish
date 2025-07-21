import type { SkillTag } from '@LearnCraft-Spanish/shared';
import type { AuthPort } from '../application/ports/authPort';
import type { SkillTagsPort } from '../application/ports/skillTagsPort';
import { createHttpClient } from '@infrastructure/http/client';
import { getSkillsEndpoint } from '@LearnCraft-Spanish/shared';

export function createSkillTagsInfrastructure(
  apiUrl: string,
  auth: AuthPort,
): SkillTagsPort {
  const httpClient = createHttpClient(apiUrl, auth);
  const getSkillTags = async (): Promise<SkillTag[]> => {
    const response = await httpClient.get<SkillTag[]>(
      getSkillsEndpoint.path,
      getSkillsEndpoint.requiredScopes,
    );
    return response;
  };

  return {
    getSkillTags,
  };
}
