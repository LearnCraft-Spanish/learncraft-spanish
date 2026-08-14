import type { LastStudiedLessonPort } from '@application/ports/lastStudiedLessonPort';
import { createLastStudiedLessonInfrastructure } from '@infrastructure/lastStudiedLessonInfrastructure';

export function useLastStudiedLessonAdapter(): LastStudiedLessonPort {
  return createLastStudiedLessonInfrastructure();
}
