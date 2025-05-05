import type { Assignment, QbUser, Week } from 'src/types/CoachingTypes';

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

/* ------------------ Main Function ------------------ */
function generateAssignment({
  homeworkCorrector,
  week,
}: {
  homeworkCorrector: QbUser;
  week: Week;
}): Assignment {
  const assignment = {
    recordId: Math.floor(Math.random() * 10000),
    relatedWeek: week.recordId,
    homeworkCorrector,
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
    assignmentName: '',
    dateCreated: '',
  };
  return assignment;
}

export default generateAssignment;
