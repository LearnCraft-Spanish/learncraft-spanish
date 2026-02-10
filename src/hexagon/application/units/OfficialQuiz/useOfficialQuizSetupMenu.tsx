import type { OfficialQuizRecord, QuizGroup } from '@learncraft-spanish/shared';
import { useSelectedCourseAndLessons } from '@application/coordinators/hooks/useSelectedCourseAndLessons';
import { useOfficialQuizzesQuery } from '@application/queries/useOfficialQuizzesQuery';
import { useCallback, useMemo, useState } from 'react';

import { useNavigate } from 'react-router-dom';

export interface UseOfficialQuizSetupMenuReturnType {
  selectedQuizGroup: QuizGroup | null;
  setSelectedQuizGroup: (quizGroupId: number) => void;
  quizNumber: number;
  setUserSelectedQuizNumber: (quizNumber: number) => void;
  quizOptions: OfficialQuizRecord[];
  quizGroups: QuizGroup[];
  startQuiz: () => void;
}
// export function getCourseCodeFromName(courseName: string) {
//   switch (courseName) {
//     case 'LearnCraft Spanish':
//       return 'lcsp';
//     case 'Spanish in One Month':
//       return 'si1m';
//     case 'Post-1MC Cohort':
//       return 'post-1mc';
//     case 'Post-Podcast Lessons':
//       return 'lcsp';
//     case 'Ser Estar Mini Course':
//       return 'ser-estar';
//     case 'Subjunctives Challenge':
//       return 'subjunctive';
//     default:
//       return 'lcsp';
//   }
// }

export function useOfficialQuizSetupMenu(): UseOfficialQuizSetupMenuReturnType {
  const {
    quizGroups,
    isLoading: officialQuizzesLoading,
    error,
  } = useOfficialQuizzesQuery();
  const { toLesson, course, updateUserSelectedCourseId } =
    useSelectedCourseAndLessons();

  const navigate = useNavigate();
  const [userSelectedQuizGroup, setUserSelectedQuizGroup] =
    useState<QuizGroup | null>(null);

  const [userSelectedQuizNumber, setUserSelectedQuizNumber] = useState(0); //quizNumber

  // useMemo to memoize the courseCode and quizNumber
  const selectedQuizGroup = useMemo(() => {
    if (userSelectedQuizGroup) {
      return userSelectedQuizGroup;
    }
    return quizGroups?.find((group) => group.courseId === course?.id) ?? null;
  }, [userSelectedQuizGroup, quizGroups, course]);

  const quizNumber = useMemo(() => {
    if (userSelectedQuizNumber) {
      return userSelectedQuizNumber;
    } else if (toLesson && selectedQuizGroup?.courseId === course?.id) {
      const selectedQuiz = selectedQuizGroup?.quizzes.find(
        (quiz) => quiz.quizNumber === toLesson.lessonNumber,
      );
      if (selectedQuiz) {
        return selectedQuiz.quizNumber;
      }
    }

    return selectedQuizGroup?.quizzes[0]?.quizNumber ?? 0;
  }, [userSelectedQuizNumber, selectedQuizGroup, toLesson, course]);

  // quizOptions are the quizzes for the selected course
  const quizOptions = useMemo(() => {
    if (!quizGroups || officialQuizzesLoading || error) {
      return [];
    }
    return selectedQuizGroup?.quizzes ?? [];
  }, [selectedQuizGroup, quizGroups, officialQuizzesLoading, error]);

  // startQuiz navigates to the quiz
  const startQuiz = useCallback(() => {
    if (quizNumber && selectedQuizGroup && quizGroups) {
      // Find the quiz group by matching quizzes with the courseCode

      const navigateTarget = `/officialquizzes/${selectedQuizGroup.urlSlug}/${quizNumber.toString()}`;
      navigate(navigateTarget);
    }
  }, [selectedQuizGroup, quizNumber, quizGroups, navigate]);

  const setSelectedQuizGroup = useCallback(
    (newQuizGroupId: number) => {
      if (!quizGroups) return;

      // Find the quiz group by matching quizzes with the courseCode
      const quizGroup = quizGroups.find((group) => group.id === newQuizGroupId);

      // update Coordinator context
      if (!quizGroup) {
        console.error('Quiz group not found');
        return;
      } else if (!quizGroup.courseId) {
        console.error('Quiz group has no course id');
      } else {
        updateUserSelectedCourseId(quizGroup.courseId);
      }
      // update local state
      setUserSelectedQuizGroup(quizGroup);
      setUserSelectedQuizNumber(0);
    },
    [updateUserSelectedCourseId, quizGroups],
  );
  return {
    selectedQuizGroup: selectedQuizGroup ?? null,
    setSelectedQuizGroup,
    quizNumber,
    setUserSelectedQuizNumber,
    quizOptions,
    quizGroups: quizGroups ?? [],
    startQuiz,
  };
}
