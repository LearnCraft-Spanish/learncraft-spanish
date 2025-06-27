import type { AuthPort } from '@application/ports/authPort';
import { useAuthInfrastructure } from '@infrastructure/auth/authInfrastructure';

/**
 * Adapter hook for authentication operations.
 * Connects the application layer to the Auth0 implementation.
 */
export function useAuthAdapter(): AuthPort {
  return useAuthInfrastructure();
}
