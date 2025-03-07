import type { Course, Membership, Week } from 'src/types/CoachingTypes';
import { getWeekEnds } from './functions';
/* ------------------ Helper Functions ------------------ */
function membershipEndingThisWeek(membership: Membership, week: Week) {
  const membershipEndDate = new Date(membership.endDate);
  const weekEnds = new Date(week.weekEnds);
  return membershipEndDate.getTime() === weekEnds.getTime();
}

function getCurrentWeek(
  weekStarts: string,
  membershipStartDate: Date | string,
) {
  const weekStartsDate = new Date(weekStarts);
  const membershipStartDateDate = new Date(membershipStartDate);
  const timeDifference =
    weekStartsDate.getTime() - membershipStartDateDate.getTime();
  const weekDifference = timeDifference / (1000 * 3600 * 24 * 7);
  return Math.floor(weekDifference);
}
/* ------------------ Mock Data ------------------ */
const weekRecordStructure = {
  weekStarts: '00-00-0000',
  weekEnds: '00-00-0000',
  recordId: 0,

  // Membership
  level: '', // I believe this is essentially the membership level
  membershipEndDate: '00-00-0000',
  membershipStudentMemberUntil: '00-00-0000',
  endingThisWeek: false,
  membershipOnHold: false,
  membershipStudentCallCreditsRemaining: 0,
  relatedMembership: 0,
  membershipCourseHasGroupCalls: false,
  membershipCourseWeeklyPrivateCalls: 0,

  // Generate
  week: 0,
  combinedKeyForUniques: '0-0', // relatedMembership-week
  notes: '',
  holdWeek: false,
  offTrack: false,
  primaryCoachWhenCreated: '',

  // Assignments, Calls, & Group Calls
  numberOfGroupCalls: 0,
  privateCallsCompleted: 0,
  OfCallsPrivateGroup: 0,

  assignmentRatings: [],
  privateCallRatings: [],
  groupCallComments: [],

  // Completeness?
  recordCompletable: false,
  recordsComplete: false,
  recordsCompleteRef: 0,
  checklistComplete: false,
  // not currently used in our frontend, will be deciding in the future if we keep this data, or rebuild its structure
  currentLessonName: '',
  currentLesson: null,
  bundleCreditsUsed: 0,
  badRecord: false,
};
const notes = [
  'student did great',
  'no call no show',
  'i have no opinion, i am just a mock :D',
];
/* ------------------ Main Function ------------------ */
function generateWeek({
  course,
  membership,
  holdWeek,
  recordsComplete,
  weekStarts,
}: {
  course: Course;
  membership: Membership;
  holdWeek: boolean;
  recordsComplete: boolean;
  weekStarts: string;
}): Week {
  // Step one: initial record creation
  const weekRecord = {
    ...weekRecordStructure,

    // Membership attributes
    level: course.name, // not currently in membership object, ignoring for now
    relatedMembership: membership.recordId,
    membershipEndDate: membership.endDate,
    membershipStudentMemberUntil: membership.endDate,
    // endingThisWeek: membershipEndingThisWeek(membership, weekRecord),
    membershipOnHold: membership.onHold,
    membershipStudentCallCreditsRemaining: 0, // unsure what this variable is/does or how to get it
    membershipCourseHasGroupCalls: course.hasGroupCalls,
    membershipCourseWeeklyPrivateCalls: course.weeklyPrivateCalls,

    weekStarts,
    weekEnds: getWeekEnds(weekStarts),
    recordId: Math.floor(Math.random() * 10000),
    week: getCurrentWeek(weekStarts, membership.startDate),
    // combinedKeyForUniques: '0-0', // relatedMembership-week

    recordsComplete,
    holdWeek,

    notes:
      Math.random() > 0.5
        ? notes[Math.floor(Math.random() * notes.length)]
        : '',

    // unsure about these, setting reasonable defaults
    recordCompletable: true,
    recordsCompleteRef: recordsComplete ? 100 : 0, //percent, for reporting purposes
    checklistComplete: true,
    offTrack: false,
    primaryCoachWhenCreated: 'Primary Coach Hard Coded, unsure of its use',

    // IN STRUCTURE BUT NOT USED
    // currentLessonName: '',
    // currentLesson: null,
    // bundleCreditsUsed: 0,
    // badRecord: false,
  };
  // Step Two, data that depends on the weekRecord
  weekRecord.combinedKeyForUniques = `${weekRecord.relatedMembership}-${weekRecord.week}`;
  weekRecord.endingThisWeek = membershipEndingThisWeek(membership, weekRecord);

  return weekRecord;
}

export default generateWeek;
