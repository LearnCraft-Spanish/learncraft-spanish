import type { FurnishedWeekWithCoach } from '@learncraft-spanish/shared';

export interface WeeklyRecordsPort {
  getWeeksByStartDate: (startDate: string) => Promise<FurnishedWeekWithCoach[]>;
}
