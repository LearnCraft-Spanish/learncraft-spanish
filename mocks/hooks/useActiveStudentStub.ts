import { allStudentsTable } from "../data/serverlike/studentTable";

export default function useActiveStudentStub({
  studentName = "student-admin",
  isLoading = false,
  isError = false,
}) {
  const student = allStudentsTable.find(
    (student) => student.name === studentName,
  );
  if (!student) {
    throw new Error(`Student ${studentName} not found in allStudentsTable`);
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

  const activeProgram = activeStudentQuery.data?.relatedProgram;
  const activeLesson = activeStudentQuery.data?.cohort;

  return {
    activeStudentQuery,
    activeProgram,
    activeLesson,
    studentListQuery,
  };
}
