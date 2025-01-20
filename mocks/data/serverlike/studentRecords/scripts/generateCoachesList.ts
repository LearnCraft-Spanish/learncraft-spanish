import type { Coach } from '../../../../../src/types/CoachingTypes';

/* ------------------ Helper Functions ------------------ */
function generateFakeQBId() {
  const format = 'NNNNNNNN.LLLL';
  const result = format
    .replace(/N/g, () => Math.floor(Math.random() * 10).toString())
    .replace(/L/g, () =>
      // lowercase letter, or number
      Math.random() < 0.3
        ? Math.floor(Math.random() * 10).toString()
        : String.fromCharCode(97 + Math.floor(Math.random() * 26)).toString(),
    );
  return result;
}
/* ------------------ Main Function ------------------ */

function generateCoachList({
  mockUserData,
  length = 3,
}: {
  mockUserData: { fullName: string; email: string }[];
  length: number;
}) {
  if (mockUserData.length < length) {
    throw new Error('Not enough fake people to generate coaches list');
  }
  const coaches: Coach[] = [];
  for (let i = 0; i < length; i++) {
    const data = mockUserData[i];
    const coach = {
      recordId: i,
      coach: data.fullName.split(' ')[0],
      user: {
        email: data.email,
        id: generateFakeQBId(),
        name: data.fullName,
      },
    };
    coaches.push(coach);
  }
  return coaches;
}

export default generateCoachList;
