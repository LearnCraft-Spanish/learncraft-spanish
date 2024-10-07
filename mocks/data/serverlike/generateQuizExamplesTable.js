import { fisherYatesShuffle } from "./fisherYatesShuffle.js";
import data from "./mockBackendData.json" with { type: "json" };
// This is a script files that creates the data, and outputs it to console. It is not used in the application.

const courses = [
  { name: "Spanish in One Month", url: "si1m", code: "si1m" },
  { name: "LearnCraft Spanish", url: "", code: "lcsp" },
  { name: "LearnCraft Spanish Extended", url: "lcspx", code: "lcspx" },
  { name: "Master Ser vs Estar", url: "ser-estar", code: "ser-estar" },
];

function getQuizzesForCourse(courseCode) {
  return data.api.quizzesTable.filter(
    (quiz) => courseCode === quiz.quizNickname.split(" ")[0],
  );
}

// select 2 random quizzes for each course
const quizExamples = {};
courses.forEach((course) => {
  const courseQuizzes = fisherYatesShuffle(getQuizzesForCourse(course.code));
  quizExamples[course.code] = [courseQuizzes[0], courseQuizzes[1]];
});
// eslint-disable-next-line no-console
console.log(JSON.stringify(quizExamples));

// structure json data
