import type { Lesson } from 'src/types/interfaceDefinitions';
// Helper function to get lesson number from lesson
// will be removed when schema is updated
export function getLessonNumber(lesson: Lesson | null): number | null {
  if (!lesson?.lesson) {
    return null;
  }
  const lessonArray = lesson.lesson.split(' ');
  const lessonNumberString = lessonArray.slice(-1)[0];
  const lessonNumber = Number.parseInt(lessonNumberString, 10);
  return lessonNumber;
}
