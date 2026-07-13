import type { PrivateCallsPort } from '@application/ports/privateCallsPort';
import { useAuthAdapter } from '@application/adapters/authAdapter';
import { config } from '@config';
import { createPrivateCallsInfrastructure } from '@infrastructure/weeklyRecords/privateCallsInfrastructure';

export function usePrivateCallsAdapter(): PrivateCallsPort {
  const apiUrl = config.backendDomain;
  const auth = useAuthAdapter();

  return createPrivateCallsInfrastructure(apiUrl, auth);
}
