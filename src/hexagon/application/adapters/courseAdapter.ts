import type { CoursePort } from '@application/ports/coursePort';
import { useAuthAdapter } from '@application/adapters/authAdapter';
import { createCourseInfrastructure } from '@infrastructure/vocabulary/courseInfrastructure';
import { config } from 'src/hexagon/config';

export function useCourseAdapter(): CoursePort {
  const apiUrl = config.backendDomain;
  const auth = useAuthAdapter();
  return createCourseInfrastructure(apiUrl, auth);
}
