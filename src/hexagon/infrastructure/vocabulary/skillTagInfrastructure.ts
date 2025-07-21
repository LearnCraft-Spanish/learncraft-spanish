import type { AuthPort } from '@application/ports/authPort';
import type { SkillTag } from '@LearnCraft-Spanish/shared';
import { createHttpClient } from '@infrastructure/http/client';
import { getSkillsEndpoint } from '@LearnCraft-Spanish/shared';

export function createSkillTagInfrastructure(
  apiUrl: string,
  auth: AuthPort,
  // ): SkillTagPort {
) {
  const httpClient = createHttpClient(apiUrl, auth);

  return {
    getSkillTagTable: async (): Promise<SkillTag[]> => {
      const response = await httpClient.get<SkillTag[]>(
        getSkillsEndpoint.path,
        getSkillsEndpoint.requiredScopes,
      );

      return Array.isArray(response) ? response : [];
    },
  };
}
