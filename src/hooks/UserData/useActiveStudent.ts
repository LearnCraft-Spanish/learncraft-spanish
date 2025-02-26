import type {
  FlashcardStudent,
  Lesson,
  Program,
  UserData,
} from 'src/types/interfaceDefinitions';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useMemo } from 'react';
import { useProgramTable } from 'src/hooks/CourseData/useProgramTable';
import { useBackend } from 'src/hooks/useBackend';
import { useUserData } from './useUserData';

export function useActiveStudent() {
  const { getAllUsersFromBackend } = useBackend();
  const { programTableQuery } = useProgramTable();
  const userDataQuery = useUserData();
  const queryClient = useQueryClient();

  const studentListQuery = useQuery({
    queryKey: ['studentList'],
    queryFn: getAllUsersFromBackend,
    staleTime: Infinity,
    enabled:
      userDataQuery.data?.roles.adminRole === 'coach' ||
      userDataQuery.data?.roles.adminRole === 'admin',
  });

  async function getActiveStudent(): Promise<FlashcardStudent | null> {
    if (
      (!(
        userDataQuery.data?.roles.adminRole === 'coach' ||
        userDataQuery.data?.roles.adminRole === 'admin'
      ) ||
        !queryClient.getQueryData(['activeStudentSelection'])) &&
      (userDataQuery.data?.roles.studentRole === 'student' ||
        userDataQuery.data?.roles.studentRole === 'limited')
    ) {
      const unparsedActiveStudent = userDataQuery.data;
      function parseStudent(unparsedStudent: UserData): FlashcardStudent {
        const ParsedStudent: UserData & FlashcardStudent & { roles?: any } = {
          ...unparsedStudent,
          role: unparsedStudent.roles.studentRole,
        };
        delete ParsedStudent.roles;
        return ParsedStudent as FlashcardStudent;
      }
      return parseStudent(unparsedActiveStudent); // Students are their own activeStudent
    } else if (
      userDataQuery.data?.roles.adminRole === 'coach' ||
      userDataQuery.data?.roles.adminRole === 'admin'
    ) {
      return queryClient.getQueryData(['activeStudentSelection']) || null; // Admin-selected activeStudent
    } else {
      return null;
    }
  }

  const activeStudentQuery = useQuery<FlashcardStudent | null>({
    queryKey: ['activeStudent'],
    queryFn: getActiveStudent,
    staleTime: Infinity,
    enabled: !!userDataQuery.data, // Only run once userData is available
  });

  const chooseStudent = (studentId: number | null) => {
    if (
      (userDataQuery.data?.roles.adminRole === 'coach' ||
        userDataQuery.data?.roles.adminRole === 'admin') &&
      studentListQuery.data
    ) {
      const student =
        studentListQuery.data.find(
          (student) => student.recordId === studentId,
        ) || null;
      queryClient.setQueryData(['activeStudentSelection'], student);
      queryClient.invalidateQueries({ queryKey: ['activeStudent'] });
    }
  };

  // Lookup of the active student's default program and lesson when the program table is ready.
  const activeProgram = useMemo<Program | null>(() => {
    if (
      programTableQuery.data?.length &&
      activeStudentQuery.data?.relatedProgram
    ) {
      return (
        programTableQuery.data.find(
          (program) =>
            program.recordId === activeStudentQuery.data?.relatedProgram,
        ) || null
      );
    }
    return null;
  }, [programTableQuery.data, activeStudentQuery.data]);

  const activeLesson = useMemo<Lesson | null>(() => {
    if (activeProgram && activeStudentQuery.data?.cohort) {
      const studentCohort = activeStudentQuery.data.cohort;
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
          case 'G':
            return activeProgram?.cohortGCurrentLesson;
          // case 'H': return activeProgram?.cohortHCurrentLesson
          // etc for futureproofing
        }
      };
      const cohortLesson = getCohortLesson(studentCohort);
      const maxLesson = cohortLesson || 999;
      const lessonList: Lesson[] = [];
      activeProgram.lessons?.forEach((lesson) => {
        const lessonArray = lesson.lesson.split(' ');
        const lessonString = lessonArray.slice(-1)[0];
        const lessonNumber = Number.parseInt(lessonString);
        if (lessonNumber <= maxLesson) {
          lessonList.push({ ...lesson });
        }
      });
      const lastKnownLesson: Lesson = lessonList.slice(-1)[0];
      if (lastKnownLesson) {
        return lastKnownLesson;
      }
      return null;
    }
    return null;
  }, [activeProgram, activeStudentQuery.data]);

  return {
    activeStudentQuery,
    activeProgram,
    activeLesson,
    studentListQuery,
    chooseStudent,
  };
}
