import type { Program } from "../../../src/interfaceDefinitions";

const programsTable: Program[] = [
  {
    recordId: 2,
    name: "Program 2",
    cohortACurrentLesson: 1,
    cohortBCurrentLesson: 2,
    cohortCCurrentLesson: 3,
    cohortDCurrentLesson: 4,
    cohortECurrentLesson: 5,
    cohortFCurrentLesson: 6,
    lessons: [
      {
        recordId: 3,
        lesson: "Lesson 3",
        vocabIncluded: ["es"],
        vocabKnown: ["en"],
        sortReference: 3,
        relatedProgram: 2,
      },
    ],
  },
  {
    recordId: 3,
    name: "Program 3",
    cohortACurrentLesson: 1,
    cohortBCurrentLesson: 2,
    cohortCCurrentLesson: 3,
    cohortDCurrentLesson: 4,
    cohortECurrentLesson: 5,
    cohortFCurrentLesson: 6,
    lessons: [
      {
        recordId: 4,
        lesson: "Lesson 4",
        vocabIncluded: ["es"],
        vocabKnown: ["en"],
        sortReference: 4,
        relatedProgram: 3,
      },
    ],
  },
];

export default programsTable;
