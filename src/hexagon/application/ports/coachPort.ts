import type { CoachCallCount } from '@learncraft-spanish/shared';

/**
 * Returns a list of coaches that have called the student
 * Includes the count of calls of each type per coach
 */
export interface CoachPort {
  getAllCoachesByStudent: (studentId: number) => Promise<CoachCallCount[]>;
}
