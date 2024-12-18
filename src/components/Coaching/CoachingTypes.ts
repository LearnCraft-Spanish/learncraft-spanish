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
  assignmentRatings: string;
  privateCallRatings: string;
  groupCallComments: string;
  notes: string;
  holdWeek: boolean;
  recordsComplete: boolean;
  currentLesson: number;
  primaryCoachWhenCreated: string;
  recordCompletable: boolean;
  recordId: number;
  relatedMembership: number;
  week: number;
  weekEnds: Date | string;
}
export interface Student {
  recordId: number;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  timeZone: string;
  usPhone: number;
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
  student: number;
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
}

/* wild backend call with 5 arrays */
export type getLastThreeWeeksResponse = [
  Week[],
  Call[],
  GroupSession[],
  GroupAttendees[],
  Assignment[],
];
