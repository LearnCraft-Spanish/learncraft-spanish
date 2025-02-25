// This is the value returned for data of type user
// if sending a user data to quickbase, only the id is required
import type { Expanded } from './interfaceDefinitions';

export type QbUser = Expanded<{
  email: string;
  id: string;
  name: string;
  userName?: string;
}>;

export type Week = Expanded<{
  weekStarts: Date | string;
  assignmentRatings: string[];
  privateCallRatings: string[];
  groupCallComments: string[];
  notes: string;
  holdWeek: boolean;
  recordsComplete: boolean;
  currentLesson: number | null;
  primaryCoachWhenCreated: string;
  recordCompletable: boolean;
  recordId: number;
  relatedMembership: number;
  week: number;
  weekEnds: string;
  level: string;
  membershipStudentMemberUntil: Date | string;
  endingThisWeek: boolean;
  membershipOnHold: boolean;
  membershipEndDate: Date | string;
  checklistComplete: boolean;
  offTrack: boolean;
  recordsCompleteRef: number;
  combinedKeyForUniques: string;
  currentLessonName: string;
  membershipStudentCallCreditsRemaining: number;
  numberOfGroupCalls: number;
  privateCallsCompleted: number;
  OfCallsPrivateGroup: number; //NumberOfCallsPrivateGroup
  badRecord: boolean;
  membershipCourseHasGroupCalls: boolean;
  membershipCourseWeeklyPrivateCalls: number;
  bundleCreditsUsed: number;
}>;

export type Student = Expanded<{
  recordId: number;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  timeZone: string;
  fluencyGoal: string;
  startingLevel: string;
  primaryCoach: QbUser;
}>;

export type Membership = Expanded<{
  recordId: number;
  active: boolean;
  onHold: boolean;
  startDate: Date | string;
  endDate: Date | string;
  lastRecordedWeekStarts: Date | string;
  relatedCourse: number;
  relatedStudent: number;
}>;

export type Lesson = Expanded<{
  recordId: number;
  lessonName: string;
  weekRef: number;
  type: string;
}>;

export type GroupSession = Expanded<{
  recordId: number;
  date: Date | string;
  coach: QbUser;
  zoomLink: string;
  topic: string;
  comments: string;
  sessionType: string;
  callDocument: string;
}>;

export type GroupAttendees = Expanded<{
  recordId: number;
  groupSession: number;
  student: number; // is actually the recordId of the associated Week record
  weekStudent: string;
  groupSessionDate: Date | string;
}>;

export type Course = Expanded<{
  recordId: number;
  name: string;
  membershipType: string;
  weeklyPrivateCalls: number;
  hasGroupCalls: boolean;
}>;

export type Coach = Expanded<{
  recordId: number;
  coach: string;
  user: QbUser;
}>;

export type Call = Expanded<{
  recordId: number;
  relatedWeek: number;
  recording: string;
  notes: string;
  areasOfDifficulty: string;
  rating: string;
  date: Date | string;
  caller: QbUser;
  callType: string;
}>;

export type Assignment = Expanded<{
  recordId: number;
  assignmentLink: string;
  relatedWeek: number;
  rating: string;
  assignmentType: string;
  areasOfDifficulty: string;
  notes: string;
  homeworkCorrector: QbUser;
  weekStarts: Date | string;
}>;

/* wild backend call with 5 arrays */
export type getLastThreeWeeksResponse = [
  Week[],
  Call[],
  GroupSession[],
  GroupAttendees[],
  Assignment[],
];
