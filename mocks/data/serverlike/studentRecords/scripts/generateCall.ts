import type { Call, Week } from 'src/types/CoachingTypes';
/* ------------------ Helper Functions ------------------ */

/* ------------------ Mock Data ------------------ */
const ratings = [
  'Excellent',
  'Very Good',
  'Good',
  'Fair',
  'Bad',
  'Poor',
  'Late Cancel',
  'No-Show',
];
/* ------------------ Main Function ------------------ */
function generateCall({
  week,
  callDate,
}: {
  week: Week;
  callDate: string;
}): Call {
  return {
    recordId: Math.floor(Math.random() * 10000),
    relatedWeek: week.recordId,
    recording: 'https://www.google.com/',
    notes: '',
    areasOfDifficulty: '',
    rating: ratings[Math.floor(Math.random() * ratings.length)],
    date: callDate,
  };
}

export default generateCall;
