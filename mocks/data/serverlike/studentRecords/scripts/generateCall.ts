import type { PrivateCall, QbUser, Week } from 'src/types/CoachingTypes';
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
const callTypes = ['Monthly Call', 'Uses Credit (Bundle)'];
/* ------------------ Main Function ------------------ */
function generateCall({
  week,
  callDate,
  caller,
}: {
  week: Week;
  callDate: string;
  caller: QbUser;
}): PrivateCall {
  return {
    recordId: Math.floor(Math.random() * 10000),
    relatedWeek: week.recordId,
    recording: 'https://www.google.com/',
    notes: '',
    areasOfDifficulty: '',
    rating: ratings[Math.floor(Math.random() * ratings.length)],
    date: callDate,
    caller,
    callType: Math.random() < 0.2 ? callTypes[1] : callTypes[0],
  };
}

export default generateCall;
