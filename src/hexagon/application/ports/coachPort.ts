import type {
  Coach,
  CoachCallCount,
  RecentRecords,
} from '@learncraft-spanish/shared';

/**
 * Returns a list of coaches that have called the student
 * Includes the count of calls of each type per coach
 */
export interface CoachPort {
  getAllCoachesByStudent: (studentId: number) => Promise<CoachCallCount[]>;
  getAllCoaches: () => Promise<Coach[]>;
  getRecentRecords: (
    coachId: string,
    monthYear: string,
  ) => Promise<RecentRecords>;
}
