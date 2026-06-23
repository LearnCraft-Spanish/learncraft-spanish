import type {
  BaseAssignment,
  BaseGroupSession,
  FurnishedWeek,
} from '@learncraft-spanish/shared';
import type { QbUser } from 'src/types/CoachingTypes';

type PrivateCallItem = FurnishedWeek['privateCalls'][number];

export interface CoachSummaryData {
  primaryCoach: string;
  recordsCompleteRefAvg: string;
  recordIdDistinctCount: number;
}

export interface CoachSummaryDrilldownData {
  recordId: number;
  student: string;
  level: string;
  primaryCoach: QbUser;
  weekStarts: string;
  assignments: BaseAssignment[];
  privateCalls: PrivateCallItem[];
  groupCalls: BaseGroupSession[];
  currentLessonName: string;
  notes: string;
  holdWeek: boolean;
  recordsComplete: number;
}
