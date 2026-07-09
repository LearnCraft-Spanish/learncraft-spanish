import type { SrLesson } from '@learncraft-spanish/shared';

export interface SrLessonsPort {
  getSrLessons: () => Promise<SrLesson[]>;
}
