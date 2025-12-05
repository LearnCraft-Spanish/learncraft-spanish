import { useOfficialQuizzesQuery } from '@application/queries/useOfficialQuizzesQuery';
import { officialQuizCourses } from '@learncraft-spanish/shared';
import { useMemo } from 'react';
export interface SearchByQuizProps {
  courseCode: string;
  quizNumber: number | '';
  onCourseCodeChange: (value: string) => void;
  onQuizNumberChange: (value: number | '') => void;
}

export function SearchByQuiz({
  courseCode,
  quizNumber,
  onCourseCodeChange,
  onQuizNumberChange,
}: SearchByQuizProps) {
  // this should use the useOfficialQuiz hook to populate data for a dropdown?
  const {
    officialQuizRecords,
    isLoading: officialQuizzesLoading,
    error,
  } = useOfficialQuizzesQuery();

  // quizOptions are the quizzes for the selected course
  const quizOptions = useMemo(() => {
    if (!officialQuizRecords || officialQuizzesLoading || error) {
      return [];
    }
    const filteredQuizzes = officialQuizRecords.filter(
      (quiz) => quiz.courseCode === courseCode,
    );
    return filteredQuizzes;
  }, [courseCode, officialQuizRecords, officialQuizzesLoading, error]);

  return (
    <div>
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '0.75rem' }}>
        <select
          className="quizMenu"
          role="select"
          aria-label="Select Course"
          value={courseCode}
          onChange={(e) => {
            onCourseCodeChange(e.target.value);
            onQuizNumberChange(0);
          }}
        >
          <option value="">Select a Course</option>
          {officialQuizCourses.map((course) => (
            <option key={course.code} value={course.code}>
              {course.name}
            </option>
          ))}
        </select>
        <select
          className="quizMenu"
          role="select"
          aria-label="Select Quiz"
          value={quizNumber}
          onChange={(e) =>
            onQuizNumberChange(Number.parseInt(e.target.value) || 0)
          }
        >
          <option value={0}>Select a Quiz</option>
          {quizOptions.map((quiz) => (
            <option key={quiz.id} value={quiz.quizNumber}>
              {quiz.quizTitle}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
