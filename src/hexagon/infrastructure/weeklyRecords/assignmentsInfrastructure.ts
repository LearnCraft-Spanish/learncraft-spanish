import type { AssignmentsPort } from '@application/ports/assignmentsPort';
import type { AuthPort } from '@application/ports/authPort';
import type {
  AssignmentLookups,
  BaseAssignment,
  CreateAssignmentCommand,
  DeleteAssignmentCommand,
  UpdateAssignmentCommand,
} from '@learncraft-spanish/shared';
import { createHttpClient } from '@infrastructure/http/client';
import {
  createAssignmentEndpoint,
  deleteAssignmentEndpoint,
  getAssignmentLookupsEndpoint,
  updateAssignmentEndpoint,
} from '@learncraft-spanish/shared';
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
    createAssignment: async (assignment: CreateAssignmentCommand) => {
      const response = await httpClient.post<BaseAssignment>(
        createAssignmentEndpoint.path,
        createAssignmentEndpoint.requiredScopes,
        {
          assignment,
        },
      );
      return createAssignmentEndpoint.response.parse(response);
    },
    updateAssignment: async (assignment: UpdateAssignmentCommand) => {
      const response = await httpClient.put<BaseAssignment>(
        updateAssignmentEndpoint.path,
        updateAssignmentEndpoint.requiredScopes,
        { assignment },
      );
      return updateAssignmentEndpoint.response.parse(response);
    },
    deleteAssignment: async (data: DeleteAssignmentCommand) => {
      await httpClient.delete<void>(
        deleteAssignmentEndpoint.path.replace(
          ':assignmentId',
          String(data.assignmentId),
        ),
        deleteAssignmentEndpoint.requiredScopes,
      );
    },
  };
}
