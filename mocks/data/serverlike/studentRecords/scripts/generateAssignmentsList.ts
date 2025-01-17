import type {
  Assignment,
  QbUser,
  Week,
} from '../../../../../src/types/CoachingTypes';

/* ------------------ Mock Data ------------------ */
const assignmentTypes = ['Pronounciation', 'Writing', 'journal'];
const ratings = ['Excellent', 'Very Good', 'Good', 'Fair', 'Bad', 'Poor'];
const areasOfDifficulty = [
  'no mistakes',
  'syllable stressing',
  'accents',
  'vowels',
  'RR sound',
];
const assignmentLinks = ['https://www.google.com/'];

/* ------------------ Main Function ------------------
 *  This function will return 1 assignment record for each week record
 */
function generateAssignmentsList({
  homeworkCorrectors,
  weekRecords,
}: {
  homeworkCorrectors: QbUser[];
  weekRecords: Week[];
}): Assignment[] {
  const assignments: Assignment[] = [];
  for (let i = 0; i < weekRecords.length; i++) {
    const week = weekRecords[i];
    const assignment = {
      recordId: i + 1,
      relatedWeek: week.recordId,
      homeworkCorrector:
        homeworkCorrectors[
          Math.floor(Math.random() * homeworkCorrectors.length)
        ],
      assignmentType:
        assignmentTypes[Math.floor(Math.random() * assignmentTypes.length)],
      rating: ratings[Math.floor(Math.random() * ratings.length)],
      areasOfDifficulty:
        Math.random() > 0.5
          ? areasOfDifficulty[
              Math.floor(Math.random() * areasOfDifficulty.length)
            ]
          : '',
      notes: '',
      weekStarts: week.weekStarts,
      assignmentLink:
        assignmentLinks[Math.floor(Math.random() * assignmentLinks.length)],
    };
    assignments.push(assignment);
  }
  return assignments;
}

export default generateAssignmentsList;
