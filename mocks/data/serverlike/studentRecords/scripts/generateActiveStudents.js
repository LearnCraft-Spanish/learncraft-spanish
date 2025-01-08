import fakePeopleList from './fakePeople.json' assert { type: 'json' };
import mockData from './mockData.json' assert { type: 'json' };
const activeStudentTemplate = {
  recordId: 0,
  firstName: '',
  lastName: '',
  fullName: '',
  email: '',
  timeZone: 'Pacific - US', // examples: 'Pacific/Central/Eastern - US', 'GMT-0', 'UK', 'CET', ''
  usPhone: '', // often not provided, ex: '(000) 000-0000'
  fluencyGoal: '',
  startingLevel: '',
  primaryCoach: {}, // 'user' attribute of a coach from coachListQuery
};

const exampleFluencyGoals = [
  'Introduce myself and share basic personal details in Spanish.',
  'Order food and drinks confidently at a restaurant in Spanish.',
  'Ask for directions and understand basic responses in Spanish.',
  'Hold a five-minute conversation about my hobbies in Spanish.',
  'Talk about my daily routine using present tense verbs.',
  'Describe my family and their interests in Spanish.',
  'Understand and respond to common greetings and farewells.',
  'Talk about the weather and seasonal activities in Spanish.',
  'Ask basic questions while shopping, like prices or sizes.',
  'Count to 100 and use numbers in common scenarios.',
];
const exampleStartingLevels = [
  "I remember basic greetings like 'hola,' 'buenos días,' and 'cómo estás' from high school Spanish.",
  'I can count to 20 and know the days of the week in Spanish.',
  'I’ve completed Lesson 5 in your free course and can introduce myself and talk about where I’m from.',
  'I know how to conjugate a few verbs like ser and tener in the present tense.',
  'I can name colors, numbers, and a few animals in Spanish.',
  "I’ve used apps like Duolingo and know some common phrases like 'dónde está el baño.' ",
  'I can recognize Spanish vocabulary for food and drinks but struggle to form full sentences.',
  'I’ve taken Spanish classes before but need help refreshing my grammar, especially verb conjugations.',
];
function generateActiveStudentsData({ coachList, numberOfRecords }) {
  if (numberOfRecords > fakePeopleList.length) {
    throw new Error(
      'numberOfRecords requested is larger than the number of fakePeople we have prepared!',
    );
  }
  const results = [];
  for (let i = 0; i < numberOfRecords; i++) {
    const fakePerson = fakePeopleList[i];
    results.push({
      recordId: Math.floor(Math.random() * 10000), // Random number between 0 and 9999
      firstName: fakePerson.fullName.split(' ')[0],
      lastName: fakePerson.fullName.split(' ')[1],
      fullName: fakePerson.fullName,
      email: fakePerson.email,
      timeZone: '',
      usPhone: '',
      fluencyGoal:
        Math.random() > 0.5
          ? exampleFluencyGoals[Math.floor(Math.random() * 10)]
          : '',
      startingLevel:
        Math.random() > 0.5
          ? exampleStartingLevels[Math.floor(Math.random() * 8)]
          : '',
      primaryCoach: coachList[i % coachList.length].user,
    });
  }
  return results;
}

// function getFullNamesFromEmails() {
//   function getNameFromEmail(email) {
//     const stepOne = email.split('@')[0].split('-').join(' ');
//     // remove any numbers at end
//     const stepTwo = stepOne.replace(/\d+$/, '');
//     // replace any - or _ with ' '
//     const stepThree = stepTwo.replace(/[-_]/g, ' ');
//     // capitalize first letter of each word
//     const stepFour = stepThree
//       .split(' ')
//       .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
//       .join(' ');
//     return stepFour;
//   }
//   const results = randomEmails.map((email) => {
//     return {
//       fullName: getNameFromEmail(email),
//       email: email,
//     };
//   });
//   return results;
// }

// console.log(JSON.stringify(getFullNamesFromEmails()));

const coachList = mockData.coachList.slice(0, 2);

const results = generateActiveStudentsData({ coachList, numberOfRecords: 10 });
console.log(results);
