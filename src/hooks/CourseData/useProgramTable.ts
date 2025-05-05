import type {
  Lesson,
  Program,
  ProgramUnparsed,
} from 'src/types/interfaceDefinitions';
import { useQuery } from '@tanstack/react-query';
import { useCallback } from 'react'; // Adjust the import based on your project structure
import useAuth from 'src/hooks/useAuth';
import { useBackend } from 'src/hooks/useBackend';

export function useProgramTable() {
  const { getLessonsFromBackend, getProgramsFromBackend } = useBackend();
  const { isAuthenticated } = useAuth();

  function parseLessonsByVocab(
    courses: ProgramUnparsed[],
    lessonTable: Lesson[],
  ): Program[] {
    const oldCourseArray: ProgramUnparsed[] = [...courses];
    oldCourseArray.sort((a, b) => a.recordId - b.recordId);

    // Memo for combined 1MC vocabularies
    let combined1mcVocabulary: string[] = [];
    let combinedLCSVoabulary: string[] = [];

    const newCourseArray: Program[] = oldCourseArray.map((course) => {
      let combinedVocabulary: string[] = [];
      if (course.recordId === 5) {
        combinedVocabulary = [...combined1mcVocabulary];
      }
      if (course.recordId === 7) {
        combinedVocabulary = [...combinedLCSVoabulary];
      }
      const lessonSortFunction = (a: Lesson, b: Lesson) => {
        function findNumber(stringLesson: string) {
          const lessonArray = stringLesson.split(' ');
          const lessonNumber = lessonArray.slice(-1)[0];
          const lessonNumberInt = Number.parseInt(lessonNumber);
          return lessonNumberInt;
        }
        return findNumber(a.lesson) - findNumber(b.lesson);
      };
      const parsedLessonArray: Lesson[] = [];
      // Foreign Key lookup, form data in backend
      lessonTable.forEach((lesson) => {
        if (lesson.relatedProgram === course.recordId) {
          parsedLessonArray.push({ ...lesson });
        }
      });
      parsedLessonArray.sort(lessonSortFunction);
      const newCourse: Program = { ...course, lessons: [] };
      newCourse.lessons = parsedLessonArray;
      newCourse.lessons.forEach((lesson) => {
        lesson.vocabIncluded.forEach((word) => {
          if (!combinedVocabulary.includes(word)) {
            combinedVocabulary.push(word);
          }
        });
        lesson.vocabKnown = [...combinedVocabulary];
        // Foreign Key lookup, form data in backend
        if (course.recordId === 3) {
          combined1mcVocabulary = [...combinedVocabulary];
        }
        if (course.recordId === 2) {
          // Foreign Key lookup, form data in backend
          combinedLCSVoabulary = [...combinedVocabulary];
        }
      });
      return newCourse;
    });
    return newCourseArray;
  }

  const parseCourseLessons = useCallback(async (): Promise<Program[]> => {
    try {
      const lessonTablePromise = getLessonsFromBackend();
      const coursesPromise = getProgramsFromBackend();

      // Using Promise.all to wait for both promises to resolve
      const [courses, lessonTable] = await Promise.all([
        coursesPromise,
        lessonTablePromise,
      ]);

      if (courses && lessonTable) {
        // Parse lessons based on vocab and return result
        const parsedLessons: Program[] = parseLessonsByVocab(
          courses,
          lessonTable,
        );
        return parsedLessons;
      } else {
        throw new Error('Failed to get programs or lessons');
      }
    } catch (error) {
      console.error(error);
      throw error; // Re-throw to propagate the error
    }
  }, [getLessonsFromBackend, getProgramsFromBackend]);

  const programTableQuery = useQuery({
    queryKey: ['programs'],
    queryFn: parseCourseLessons,
    staleTime: Infinity,
    gcTime: Infinity,
    enabled: isAuthenticated,
  });

  return { programTableQuery };
}
