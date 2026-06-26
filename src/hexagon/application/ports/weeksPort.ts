import type { FurnishedWeek } from '@learncraft-spanish/shared';

export interface WeeksPort {
  getMembershipWeeks: (membershipId: number) => Promise<FurnishedWeek[]>;
}
