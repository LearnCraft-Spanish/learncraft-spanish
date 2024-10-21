// This file contains the list of courses that are available for quizzes.
// They differ from the courses in that LCSP has two versions and post-1MC has none yet.

import type { QuizCourse } from "../interfaceDefinitions";

const quizCourses: QuizCourse[] = [
  { name: "Spanish in One Month", url: "si1m", code: "si1m" },
  { name: "LearnCraft Spanish", url: "", code: "lcsp" },
  { name: "LearnCraft Spanish Extended", url: "lcspx", code: "lcspx" },
  { name: "Master Ser vs Estar", url: "ser-estar", code: "ser-estar" },
];

export default quizCourses;