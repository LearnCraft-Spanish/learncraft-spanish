import type { OfficialQuizRecord } from '@learncraft-spanish/shared';

export interface UseOfficialQuizSetupMenuReturnType {
  courseCode: string;
  setUserSelectedCourseCode: (courseCode: string) => void;
  quizNumber: number;
  setUserSelectedQuizNumber: (quizNumber: number) => void;
  quizOptions: OfficialQuizRecord[];
  startQuiz: () => void;
}
