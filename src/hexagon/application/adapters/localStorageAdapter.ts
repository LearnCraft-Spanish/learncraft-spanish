import type { LocalStoragePort } from '@application/ports/localStoragePort';
import { createLocalStorageInfrastructure } from '@infrastructure/localStorageInfrastructure';

export function LocalStorageAdapter(): LocalStoragePort {
  return createLocalStorageInfrastructure();
}
