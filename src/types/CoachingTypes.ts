// This is the value returned for data of type user
// if sending a user data to quickbase, only the id is required
export interface QbUser {
  email: string;
  id: string;
  name: string;
  userName?: string;
}

export interface Week {
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
  // blankUser: QbUser | undefined;
}
/*
  export interface Week {
  student: string;
  level: string;
  primaryCoach: QbUser;
  weekStarts: Date | string;
  assignmentRatings: string[];
  privateCallRatings: string[];
  addPrivateCall: string;
  numberOfGroupCalls: number;
  groupCallComments: string[];
  currentLessonName: string;
  notes: string;
  holdWeek: boolean;
  recordsComplete: boolean;
  membershipStudentCallCreditsRemaining: number;
  OfCallsPrivateGroup: number; //NumberOfCallsPrivateGroup
  addAssignment: string;
  addAttendee: string;
  assignmentPerformance: number | null;
  assignments: unknown;
  assignmentsCompleted: number;
  attendees: unknown;
  badRecord: boolean;
  baseDate: Date | string;
  blankUser: QbUser | null;
  bundleCreditsUsed: number;
  callPerformance: number | null;
  calls: unknown;
  checklistComplete: boolean;
  combinedKeyForUniques: string;
  currentLesson: number;
  dateCreated: Date | string;
  dateModified: Date | string;
  endingThisWeek: boolean;
  lastModifiedBy: QbUser;
  membershipActive: boolean;
  membershipCourseHasGroupCalls: boolean;
  membershipCourseWeeklyPrivateCalls: number;
  membershipEndDate: Date | string;
  membershipOnHold: boolean;
  membershipRelatedStudentHasGroupCalls: boolean;
  membershipRelatedStudentRecordIdPurchasedBundle: string;
  membershipRelatedStudentRecordIdRelatedCoach: number;
  membershipRelatedStudentWeeklyPrivateCalls: number;
  membershipStartDate: Date | string;
  membershipStudentMemberUntil: Date | string;
  membershipName: string;
  offTrack: boolean;
  primaryCoachWhenCreated: string;
  privateCallsCompleted: number;
  recordCompletable: boolean;
  recordId: number;
  recordOwner: QbUser;
  recordsCompleteRef: number;
  relatedMembership: number;
  relatedMembershipRecordIdActive: boolean;
  week: number; //WeekNumber
  weekEnds: Date | string;
  weekName: string;
}
*/
/*
-- UNUSED, probably deleting soon
export interface NewWeek {
  student: string;
  level: string;
  primaryCoachWhenCreated: string;
  weekStarts: string | Date;
  assignmentRatings: string;
  numberOfGroupCalls: number;
  groupCallComments: string;
  currentLessonName: string;
  notes: string;
  holdWeek: boolean;
  recordsComplete: boolean;
  membershipStudentCallCreditsRemaining: number;
  recordId: number;
}
*/
export interface Student {
  recordId: number;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  timeZone: string;
  fluencyGoal: string;
  startingLevel: string;
  primaryCoach: QbUser;
}
export interface Membership {
  recordId: number;
  active: boolean;
  onHold: boolean;
  startDate: Date | string;
  endDate: Date | string;
  lastRecordedWeekStarts: Date | string;
  relatedCourse: number;
  relatedStudent: number;
}
export interface Lesson {
  recordId: number;
  lessonName: string;
  weekRef: number;
  type: string;
}
export interface GroupSession {
  recordId: number;
  date: Date | string;
  coach: QbUser;
  zoomLink: string;
  topic: string;
  comments: string;
  relatedCoach: number;
  sessionType: string;
  callDocument: string;
}
export interface GroupAttendees {
  recordId: number;
  groupSession: number;
  student: number; // is actually the recordId of the associated Week record
  weekStudent: string;
  groupSessionDate: Date | string;
}
export interface Course {
  recordId: number;
  name: string;
  membershipType: string;
  weeklyPrivateCalls: number;
  hasGroupCalls: boolean;
}
export interface Coach {
  recordId: number;
  coach: string;
  user: QbUser;
}
export interface Call {
  recordId: number;
  relatedWeek: number;
  recording: string;
  notes: string;
  areasOfDifficulty: string;
  rating: string;
  date: Date | string;
}
export interface Assignment {
  recordId: number;
  assignmentLink: string;
  relatedWeek: number;
  rating: string;
  assignmentType: string;
  areasOfDifficulty: string;
  notes: string;
  homeworkCorrector: QbUser;
  weekStarts: Date | string;
  // Missing:
  // Assignment Name // This is a formula - text
  // Week - Primary Coach // This is a lookup field in qb, from the Week table, not needed on the front end
}

/* wild backend call with 5 arrays */
export type getLastThreeWeeksResponse = [
  Week[],
  Call[],
  GroupSession[],
  GroupAttendees[],
  Assignment[],
];
