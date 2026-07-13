import type { AssignmentsPort } from '@application/ports/assignmentsPort';
import { useAuthAdapter } from '@application/adapters/authAdapter';
import { config } from '@config';
import { createAssignmentsInfrastructure } from '@infrastructure/weeklyRecords/assignmentsInfrastructure';

export function useAssignmentsAdapter(): AssignmentsPort {
  const apiUrl = config.backendDomain;
  const auth = useAuthAdapter();

  return createAssignmentsInfrastructure(apiUrl, auth);
}
