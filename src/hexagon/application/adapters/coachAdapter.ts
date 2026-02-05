import type { CoachPort } from '@application/ports/coachPort';
import { useAuthAdapter } from '@application/adapters/authAdapter';
import { config } from '@config';
import { createCoachInfrastructure } from '@infrastructure/coachInfrastructure';

export function useCoachAdapter(): CoachPort {
  const apiUrl = config.backendDomain;
  const auth = useAuthAdapter();
  return createCoachInfrastructure(apiUrl, auth);
}
