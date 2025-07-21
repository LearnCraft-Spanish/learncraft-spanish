import type { AppUserPort } from '../ports/appUserPort';
import { createAppUserInfrastructure } from '@infrastructure/appUserInfrastructure';
import { config } from 'src/hexagon/config';
import { useAuthAdapter } from './authAdapter';

export function useAppUserAdapter(): AppUserPort {
  const apiUrl = config.backendDomain;
  const auth = useAuthAdapter();
  return createAppUserInfrastructure(apiUrl, auth);
}
