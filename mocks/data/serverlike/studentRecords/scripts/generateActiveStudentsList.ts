import type { Coach, Student } from 'src/types/CoachingTypes';

/* ------------------ Helper Functions ------------------ */
/* ------------------ Mock Data ------------------ */
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

/* ------------------ Main Function ------------------ */
interface GenerateActiveStudentsDataProps {
  coachList: Coach[];
  length: number;
  mockUserData: { fullName: string; email: string }[];
}
function generateActiveStudentsData({
  coachList,
  length = 3,
  mockUserData,
}: GenerateActiveStudentsDataProps): Student[] {
  if (length > mockUserData.length) {
    throw new Error(
      'number of student records requested is larger than the number of mockUserData we have prepared!',
    );
  }
  const studentsList: Student[] = [];
  for (let i = 0; i < length; i++) {
    const fakePerson = mockUserData[i];
    const student = {
      recordId: i + 100, // 100 was a random choice, just dont want it to be same as coach recordId
      firstName: fakePerson.fullName.split(' ')[0],
      lastName: fakePerson.fullName.split(' ')[1],
      fullName: fakePerson.fullName,
      email: fakePerson.email,
      timeZone: '', //currently unused in app, leaving blank
      fluencyGoal:
        Math.random() > 0.5
          ? exampleFluencyGoals[Math.floor(Math.random() * 10)]
          : '',
      startingLevel:
        Math.random() > 0.5
          ? exampleStartingLevels[Math.floor(Math.random() * 8)]
          : '',
      primaryCoach: coachList[i % coachList.length].user,
      relatedCoach: coachList[i % coachList.length].user.id,
      pronoun: '',
      learningDisabilities: '',
      billingEmail: '',
      billingNotes: '',
      firstSubscribed: '',
      advancedStudent: false,
      active: true,
      usPhone: 1234567890,
    };
    studentsList.push(student);
  }
  return studentsList;
}

export default generateActiveStudentsData;
