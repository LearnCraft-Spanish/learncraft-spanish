import type { AuthPort } from '@application/ports/authPort';
import type { PrivateCallsPort } from '@application/ports/privateCallsPort';
import type {
  BasePrivateCall,
  CreatePrivateCallCommand,
  DeletePrivateCallCommand,
  PrivateCallLookups,
  UpdatePrivateCallCommand,
} from '@learncraft-spanish/shared';
import { createHttpClient } from '@infrastructure/http/client';
import {
  createPrivateCallEndpoint,
  deletePrivateCallEndpoint,
  getPrivateCallLookupsEndpoint,
  updatePrivateCallEndpoint,
} from '@learncraft-spanish/shared';

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
    createPrivateCall: async (privateCall: CreatePrivateCallCommand) => {
      const response = await httpClient.post<BasePrivateCall>(
        createPrivateCallEndpoint.path,
        createPrivateCallEndpoint.requiredScopes,
        { privateCall },
      );
      return createPrivateCallEndpoint.response.parse(response);
    },
    updatePrivateCall: async (privateCall: UpdatePrivateCallCommand) => {
      const response = await httpClient.put<BasePrivateCall>(
        updatePrivateCallEndpoint.path,
        updatePrivateCallEndpoint.requiredScopes,
        { privateCall },
      );
      return updatePrivateCallEndpoint.response.parse(response);
    },
    deletePrivateCall: async (data: DeletePrivateCallCommand) => {
      await httpClient.delete<void>(
        deletePrivateCallEndpoint.path.replace(':callId', String(data.callId)),
        deletePrivateCallEndpoint.requiredScopes,
      );
    },
  };
}
