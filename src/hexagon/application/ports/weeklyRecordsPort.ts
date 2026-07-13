import type {
  BaseWeek,
  FurnishedWeekWithCoach,
  UpdateWeekCommand,
} from '@learncraft-spanish/shared';

export interface WeeklyRecordsPort {
  getWeeksByStartDate: (startDate: string) => Promise<FurnishedWeekWithCoach[]>;
  updateWeeks: (weeks: UpdateWeekCommand[]) => Promise<BaseWeek[]>;
}
