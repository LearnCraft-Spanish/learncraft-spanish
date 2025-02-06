import {
  allStudentsTable,
  getActiveStudentFromName,
} from '../data/serverlike/studentTable';

import programsTable from '../data/hooklike/programsTable';

interface mockActiveStudentStubOptions {
  isLoading?: boolean;
  isError?: boolean;
  studentName?:
    | 'admin-empty-role'
    | 'empty-role'
    | 'none-role'
    | 'limited'
    | 'student-admin'
    | 'student-lcsp'
    | 'student-ser-estar';
}

export default function mockActiveStudentStub({
  isLoading = false,
  isError = false,
  studentName = 'student-admin',
}: mockActiveStudentStubOptions = {}) {
  const student = getActiveStudentFromName(studentName);
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

  function getActiveProgram() {
    const foundProgram = programsTable.find(
      (program) => program.recordId === activeStudentQuery.data?.relatedProgram,
    );
    return foundProgram || null;
  }

  function getActiveLesson() {
    const activeProgram = getActiveProgram();
    if (!activeProgram) {
      return null;
    }
    const cohort = activeStudentQuery.data?.cohort;
    const getCohortLesson = (cohort: string) => {
      switch (cohort) {
        case 'A':
          return activeProgram?.cohortACurrentLesson;
        case 'B':
          return activeProgram?.cohortBCurrentLesson;
        case 'C':
          return activeProgram?.cohortCCurrentLesson;
        case 'D':
          return activeProgram?.cohortDCurrentLesson;
        case 'E':
          return activeProgram?.cohortECurrentLesson;
        case 'F':
          return activeProgram?.cohortFCurrentLesson;
        // case 'G': return activeProgram?.cohortGCurrentLesson
        // if added, add to interface and real hook
        // etc for futureproofing
      }
    };
    // Below is a TEMPORY fix for the active lesson
    // activeLesson should be anm object of type Lesson, but at least one test required just a recordId
    // so this is the current bandaid. forgive me for my sins
    const activeLesson = getCohortLesson(cohort);
    if (!activeLesson) {
      return null;
    }
    return { recordId: activeLesson };
  }

  const activeProgram = getActiveProgram();

  const activeLesson = getActiveLesson();

  return {
    activeStudentQuery,
    activeProgram,
    activeLesson,
    studentListQuery,
  };
}
