import type { CoursePort } from '@application/ports/coursePort';
import { createCourseInfrastructure } from '@infrastructure/courseInfastructure';
import { config } from '../../config';
import { useAuthAdapter } from './authAdapter';

export function useCourseAdapter(): CoursePort {
  const apiUrl = config.backendDomain;
  const auth = useAuthAdapter();
  return createCourseInfrastructure(apiUrl, auth);
}
