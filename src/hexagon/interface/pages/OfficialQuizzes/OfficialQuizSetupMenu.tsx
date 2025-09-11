import type { OfficialQuizRecord } from '@learncraft-spanish/shared';
import { MenuButton } from '@interface/components/general/Buttons';
import { officialQuizCourses } from '@learncraft-spanish/shared';
import './OfficialQuizSetupMenu.scss';

export interface OfficialQuizSetupMenuProps {
  courseCode: string;
  setUserSelectedCourseCode: (courseCode: string) => void;
  quizNumber: number;
  setUserSelectedQuizNumber: (quizNumber: number) => void;
  quizOptions: OfficialQuizRecord[];
  startQuiz: () => void;
}
export function OfficialQuizSetupMenu({
  courseCode,
  setUserSelectedCourseCode,
  quizNumber,
  setUserSelectedQuizNumber,
  quizOptions,
  startQuiz,
}: OfficialQuizSetupMenuProps) {
  return (
    <div className="quizSelector">
      <h3>Official Quizzes</h3>
      <select
        className="quizMenu"
        role="select"
        aria-label="Select Course"
        value={courseCode}
        onChange={(e) => {
          setUserSelectedCourseCode(e.target.value);
          setUserSelectedQuizNumber(0);
        }}
      >
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
          setUserSelectedQuizNumber(Number.parseInt(e.target.value) || 0)
        }
      >
        <option value={0}>Select a Quiz</option>
        {quizOptions.map((quiz) => (
          <option key={quiz.id} value={quiz.quizNumber}>
            {quiz.quizTitle}
          </option>
        ))}
      </select>
      <div className="buttonBox">
        <button
          type="button"
          onClick={startQuiz}
          disabled={!courseCode || !quizNumber}
        >
          Begin Review
        </button>
      </div>
      <div className="buttonBox">
        <MenuButton />
      </div>
    </div>
  );
}
