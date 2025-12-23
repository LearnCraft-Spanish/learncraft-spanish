import type { CoursePort } from '@application/ports/coursePort';
import { useAuthAdapter } from '@application/adapters/authAdapter';
import { config } from '@config';
import { createCourseInfrastructure } from '@infrastructure/courseInfrastructure';

export function useCourseAdapter(): CoursePort {
  const apiUrl = config.backendDomain;
  const auth = useAuthAdapter();
  return createCourseInfrastructure(apiUrl, auth);
}
