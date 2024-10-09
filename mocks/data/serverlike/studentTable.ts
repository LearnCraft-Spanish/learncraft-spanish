import type { UserData } from "../../../src/interfaceDefinitions";

export const allStudentsTable: UserData[] = [
  {
    recordId: 1,
    name: "studentA",
    emailAddress: "studentA@fake.not",
    role: "",
    isAdmin: true,
    relatedProgram: 2,
    cohort: "B",
  },
  {
    recordId: 2,
    name: "studentB",
    emailAddress: "studentB@fake.not",
    role: "",
    isAdmin: false,
    relatedProgram: 2,
    cohort: "A",
  },
  {
    recordId: 3,
    name: "studentC",
    emailAddress: "studentC@fake.not",
    role: "none",
    isAdmin: false,
    relatedProgram: 2,
    cohort: "C",
  },
  {
    recordId: 4,
    name: "studentD",
    emailAddress: "studentD@fake.not",
    role: "limited",
    isAdmin: false,
    relatedProgram: 3,
    cohort: "A",
  },
  {
    recordId: 5,
    name: "studentE",
    emailAddress: "studentE@fake.not",
    role: "student",
    isAdmin: true,
    relatedProgram: 2,
    cohort: "F",
  },
  {
    recordId: 6,
    name: "studentF",
    emailAddress: "studentF@fake.not",
    role: "student",
    isAdmin: false,
    relatedProgram: 3,
    cohort: "D",
  },
  {
    recordId: 7,
    name: "studentG",
    emailAddress: "studentG@fake.not",
    role: "student",
    isAdmin: false,
    relatedProgram: 5,
    cohort: "E",
  },
];

export function getUserDataFromName(name: string): UserData {
  return allStudentsTable.find((student) => student.name === name)!;
}
