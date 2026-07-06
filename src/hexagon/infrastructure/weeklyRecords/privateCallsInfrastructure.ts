import type { AuthPort } from '@application/ports/authPort';
import type { PrivateCallsPort } from '@application/ports/privateCallsPort';
import type { PrivateCallLookups } from '@learncraft-spanish/shared';
import { createHttpClient } from '@infrastructure/http/client';
import { getPrivateCallLookupsEndpoint } from '@learncraft-spanish/shared';

export function createPrivateCallsInfrastructure(
  apiUrl: string,
  auth: AuthPort,
): PrivateCallsPort {
  const httpClient = createHttpClient(apiUrl, auth);

  return {
    getPrivateCallLookups: async () => {
      const response = await httpClient.get<PrivateCallLookups>(
        getPrivateCallLookupsEndpoint.path,
        getPrivateCallLookupsEndpoint.requiredScopes,
      );

      return getPrivateCallLookupsEndpoint.response.parse(response);
    },
  };
}
