import type { CoachingStudentsPort } from '@application/ports/coachingStudentsPort';
import { useAuthAdapter } from '@application/adapters/authAdapter';
import { config } from '@config';
import { createCoachingStudentsInfrastructure } from '@infrastructure/coachingStudentsInfrastructure';

export function useCoachingStudentsAdapter(): CoachingStudentsPort {
  const apiUrl = config.backendDomain;
  const auth = useAuthAdapter();
  return createCoachingStudentsInfrastructure(apiUrl, auth);
}
