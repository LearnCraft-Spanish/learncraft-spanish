import type { AssignmentsPort } from '@application/ports/assignmentsPort';
import type { AuthPort } from '@application/ports/authPort';
import type { AssignmentLookups } from '@learncraft-spanish/shared';
import { createHttpClient } from '@infrastructure/http/client';
import { getAssignmentLookupsEndpoint } from '@learncraft-spanish/shared';
export function createAssignmentsInfrastructure(
  apiUrl: string,
  auth: AuthPort,
): AssignmentsPort {
  const httpClient = createHttpClient(apiUrl, auth);

  return {
    getAssignmentLookups: async () => {
      const response = await httpClient.get<AssignmentLookups>(
        getAssignmentLookupsEndpoint.path,
        getAssignmentLookupsEndpoint.requiredScopes,
      );

      return getAssignmentLookupsEndpoint.response.parse(response);
    },
  };
}
