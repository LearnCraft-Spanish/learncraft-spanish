import type { FrequensayPort } from '../ports/frequensayPort';
import { config } from '../../config';
import { createFrequensayInfrastructure } from '../../infrastructure/frequensay/frequensayInfastructure';
import { useAuthAdapter } from './authAdapter';

export function useFrequensayAdapter(): FrequensayPort {
  const apiUrl = config.backendDomain;
  const auth = useAuthAdapter();
  return createFrequensayInfrastructure(apiUrl, auth);
}
