const courseList = [
  // {
  //   recordId: 1,
  //   name: 'Membership Program',
  //   membershipType: 'Basic Membership Program',
  //   weeklyPrivateCalls: 0,
  //   hasGroupCalls: false,
  // },
  {
    recordId: 2,
    name: 'Group Coaching (formerly Alumni)',
    membershipType: 'Group Conversation',
    weeklyPrivateCalls: 0,
    hasGroupCalls: true,
    weeklyTimeCommitmentMinutes: 15,
    approxMonthlyCost: 0,
  },
  {
    recordId: 14,
    name: 'Standard',
    membershipType: 'Private Coaching',
    weeklyPrivateCalls: 1,
    hasGroupCalls: true,
    weeklyTimeCommitmentMinutes: 15,
    approxMonthlyCost: 0,
  },
  // {
  //   recordId: 15,
  //   name: 'Premier',
  //   membershipType: 'Private Coaching',
  //   weeklyPrivateCalls: 2,
  //   hasGroupCalls: true,
  // },
  // {
  //   recordId: 16,
  //   name: '1-Month Challenge',
  //   membershipType: '1MC',
  //   weeklyPrivateCalls: 0,
  //   hasGroupCalls: false,
  // },
  // {
  //   recordId: 21,
  //   name: 'Listening Comprehension',
  //   membershipType: 'Listening Comprehension',
  //   weeklyPrivateCalls: 0,
  //   hasGroupCalls: false,
  // },
  // {
  //   recordId: 22,
  //   name: 'LCS Cohort',
  //   membershipType: 'LCS Cohort',
  //   weeklyPrivateCalls: 1,
  //   hasGroupCalls: true,
  // },
  {
    recordId: 23,
    name: 'Standard: Private-Only',
    membershipType: 'Weekly 1:1 Coaching ',
    weeklyPrivateCalls: 1,
    hasGroupCalls: false,
    weeklyTimeCommitmentMinutes: 15,
    approxMonthlyCost: 0,
  },
  // {
  //   recordId: 24,
  //   name: 'Premier: Private-Only',
  //   membershipType: '',
  //   weeklyPrivateCalls: 2,
  //   hasGroupCalls: false,
  // },
  // {
  //   recordId: 25,
  //   name: '1-Month Challenge Deluxe',
  //   membershipType: '1MC Conversation',
  //   weeklyPrivateCalls: 0,
  //   hasGroupCalls: false,
  // },
  // {
  //   recordId: 26,
  //   name: 'Ser/Estar Mini Course',
  //   membershipType: '',
  //   weeklyPrivateCalls: 0,
  //   hasGroupCalls: false,
  // },
  // {
  //   recordId: 27,
  //   name: '1MC With Coaching',
  //   membershipType: '',
  //   weeklyPrivateCalls: 1,
  //   hasGroupCalls: false,
  // },
  // {
  //   recordId: 28,
  //   name: 'Listening Comprehension with Coaching',
  //   membershipType: 'Listening Comprehension',
  //   weeklyPrivateCalls: 0,
  //   hasGroupCalls: false,
  // },
];

function generateCourseList() {
  return courseList;
}

export default generateCourseList;
