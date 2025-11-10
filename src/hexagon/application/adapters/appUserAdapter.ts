import type { AppUserPort } from '@application/ports/appUserPort';
import { useAuthAdapter } from '@application/adapters/authAdapter';
import { config } from '@config';
import { createAppUserInfrastructure } from '@infrastructure/appUserInfrastructure';

export function useAppUserAdapter(): AppUserPort {
  const apiUrl = config.backendDomain;
  const auth = useAuthAdapter();
  return createAppUserInfrastructure(apiUrl, auth);
}
