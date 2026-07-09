import type { AuthPort } from '@application/ports/authPort';
import type { GroupCallsPort } from '@application/ports/groupCallsPort';
import type {
  BaseGroupSession,
  CreateGroupSessionCommand,
  DeleteGroupSessionCommand,
  GroupCallLookups,
  UpdateGroupSessionCommand,
} from '@learncraft-spanish/shared';
import { createHttpClient } from '@infrastructure/http/client';
import {
  createGroupCallEndpoint,
  deleteGroupCallEndpoint,
  getGroupCallLookupsEndpoint,
  updateGroupCallEndpoint,
} from '@learncraft-spanish/shared';

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
    createGroupCall: async (groupCall: CreateGroupSessionCommand) => {
      const response = await httpClient.post<BaseGroupSession>(
        createGroupCallEndpoint.path,
        createGroupCallEndpoint.requiredScopes,
        { groupCall },
      );

      return createGroupCallEndpoint.response.parse(response);
    },
    updateGroupCall: async (groupCall: UpdateGroupSessionCommand) => {
      const response = await httpClient.put<BaseGroupSession>(
        updateGroupCallEndpoint.path,
        updateGroupCallEndpoint.requiredScopes,
        { groupCall },
      );

      return updateGroupCallEndpoint.response.parse(response);
    },
    deleteGroupCall: async (data: DeleteGroupSessionCommand) => {
      await httpClient.delete<void>(
        deleteGroupCallEndpoint.path.replace(
          ':groupCallId',
          String(data.groupSessionId),
        ),
        deleteGroupCallEndpoint.requiredScopes,
      );
    },
  };
}
