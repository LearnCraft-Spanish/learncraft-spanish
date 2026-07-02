import type { GroupCallsPort } from '@application/ports/groupCallsPort';
import type { AuthPort } from '@application/ports/authPort';
import type { GroupCallLookups } from '@learncraft-spanish/shared';
import { createHttpClient } from '@infrastructure/http/client';
import { getGroupCallLookupsEndpoint } from '@learncraft-spanish/shared';

export function createGroupCallsInfrastructure(
  apiUrl: string,
  auth: AuthPort,
): GroupCallsPort {
  const httpClient = createHttpClient(apiUrl, auth);

  return {
    getGroupCallLookups: async () => {
      const response = await httpClient.get<GroupCallLookups>(
        getGroupCallLookupsEndpoint.path,
        getGroupCallLookupsEndpoint.requiredScopes,
      );

      return getGroupCallLookupsEndpoint.response.parse(response);
    },
  };
}
