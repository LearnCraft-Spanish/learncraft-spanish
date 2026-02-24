import type { OfficialQuizRecord, QuizGroup } from '@learncraft-spanish/shared';
import { MenuButton } from '@interface/components/general/Buttons';
import './OfficialQuizSetupMenu.scss';

export interface OfficialQuizSetupMenuProps {
  selectedQuizGroup: QuizGroup | null;
  setSelectedQuizGroup: (quizGroupId: number) => void;
  quizNumber: number;
  setUserSelectedQuizNumber: (quizNumber: number) => void;
  quizOptions: OfficialQuizRecord[];
  quizGroups: QuizGroup[];
  startQuiz: () => void;
}
export function OfficialQuizSetupMenu({
  selectedQuizGroup,
  setSelectedQuizGroup,
  quizNumber,
  setUserSelectedQuizNumber,
  quizOptions,
  quizGroups,
  startQuiz,
}: OfficialQuizSetupMenuProps) {
  return (
    <div className="quizSelector">
      <h3>Official Quizzes</h3>
      <select
        className="quizMenu"
        role="select"
        aria-label="Select Course"
        value={selectedQuizGroup?.id?.toString() ?? ''}
        onChange={(e) => {
          setSelectedQuizGroup(Number.parseInt(e.target.value) || 0);
          setUserSelectedQuizNumber(0);
        }}
      >
        {quizGroups.map((group) => {
          // Get the courseCode from the first quiz in the group
          return (
            <option key={group.id} value={group.id}>
              {group.name}
            </option>
          );
        })}
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
          disabled={
            quizOptions.find((quiz) => quiz.quizNumber === quizNumber) ===
            undefined
          }
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
