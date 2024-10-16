import { allStudentsTable, getUserDataFromName } from "../data/serverlike/studentTable";

import programsTable from "../data/hooklike/programsTable";

interface mockActiveStudentStubOptions {
  isLoading?: boolean;
  isError?: boolean;
  studentName?:
    | "admin-empty-role"
    | "empty-role"
    | "none-role"
    | "limited"
    | "student-admin"
    | "student-lcsp"
    | "student-ser-estar";
}

export default function mockActiveStudentStub({
  isLoading = false,
  isError = false,
  studentName = "student-admin",
}: mockActiveStudentStubOptions = {}) {
  const student = getUserDataFromName(studentName);
  if (!student) {
    throw new Error(`Student not found in allStudentsTable: ${studentName}`);
  }
  const activeStudentQuery = {
    data: student,
    isLoading,
    isError,
  };

  const studentListQuery = {
    data: allStudentsTable,
    isLoading,
    isError,
  };

  const activeProgram = programsTable.find(
      (program) => program.recordId === activeStudentQuery.data?.relatedProgram
    );
  if (!activeProgram) { throw new Error("Active program not found"); }

  const activeLesson = activeProgram.lessons[0];

  return {
    activeStudentQuery,
    activeProgram,
    activeLesson,
    studentListQuery,
  };
}
