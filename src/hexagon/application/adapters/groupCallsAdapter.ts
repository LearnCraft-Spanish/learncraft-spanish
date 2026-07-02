import type { GroupCallsPort } from '@application/ports/groupCallsPort';
import { useAuthAdapter } from '@application/adapters/authAdapter';
import { config } from '@config';
import { createGroupCallsInfrastructure } from '@infrastructure/weeklyRecords/groupCallsInfrastructure';

export function useGroupCallsAdapter(): GroupCallsPort {
  const apiUrl = config.backendDomain;
  const auth = useAuthAdapter();

  return createGroupCallsInfrastructure(apiUrl, auth);
}
