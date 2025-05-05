import type {
  Assignment,
  GroupSessionWithAttendees,
  PrivateCall,
  QbUser,
} from 'src/types/CoachingTypes';

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
  assignments: Assignment[];
  privateCalls: PrivateCall[];
  groupCalls: GroupSessionWithAttendees[];
  currentLessonName: string;
  notes: string;
  holdWeek: boolean;
  recordsComplete: number;
}
