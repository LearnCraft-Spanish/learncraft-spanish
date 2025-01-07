// Based off of the Week Type as of 01/06/24
const weekRecordStructure = {
  level: '',
  weekStarts: '0000-00-00',
  assignmentRatings: [],
  privateCallRatings: [],
  numberOfGroupCalls: 0,
  groupCallComments: [],
  currentLessonName: '',
  notes: '',
  holdWeek: false,
  recordsComplete: false,
  membershipStudentCallCreditsRemaining: 0,
  checklistComplete: false,
  combinedKeyForUniques: '0-0',
  currentLesson: null,
  endingThisWeek: false,
  membershipEndDate: '0000-00-00',
  membershipOnHold: false,
  membershipStudentMemberUntil: '0000-00-00',
  offTrack: false,
  primaryCoachWhenCreated: '',
  privateCallsCompleted: 0,
  recordCompletable: false,
  recordId: 0,
  recordsCompleteRef: 0,
  relatedMembership: 0,
  week: 0,
  weekEnds: '0000-00-00',
};

/* 
Things that need to be set for each weekRecord
Dates:
- weekStarts
- weekEnds
- membershipEndDate (based on membership?)
- membershipStudentMemberUntil (based on membership?)

id's
- recordid
- relatedMembership
- week (# of week this record is on)
- combinedKeyForUniques (relatedMembership-week)

text:
- level
- currentLessonName
- notes
- primaryCoachWhenCreated?

unknowns:
currentLesson?
checklistComplete?
numberOfGroupCalls?
membershipStudentCallCreditsRemaining?



privateCallsCompleted // Determines if private calls get rendered
numberOfGroupCalls // Determines if group calls get rendered
assignmentRatings.length // Determines if assignments get rendered

*/
