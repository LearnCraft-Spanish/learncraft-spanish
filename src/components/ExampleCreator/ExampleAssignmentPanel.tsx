import type { UseQueryResult } from '@tanstack/react-query';
import type {
  Flashcard,
  FlashcardStudent,
  StudentFlashcardData,
} from 'src/types/interfaceDefinitions';
import React, { useMemo } from 'react';
import ExamplesTable from 'src/components/ExamplesTable/ExamplesTable';
import StudentSearch from 'src/components/StudentSearch';
import quizCourses from 'src/functions/QuizCourseList';

interface ExampleAssignmentPanelProps {
  assignmentType: 'students' | 'quiz';
  onToggleAssignmentType: () => void;
  tableOption: string;
  onTableOptionChange: (option: string) => void;
  quizId?: number;
  onQuizIdChange: (id: number) => void;
  quizList?: Array<{
    recordId: number;
    quizNickname?: string;
    quizNumber?: number;
  }>;
  selectedQuizObject?: {
    recordId: number;
    quizNickname?: string;
    quizNumber?: number;
  };
  exampleSetQuery: UseQueryResult<Flashcard[], unknown>;
  unassignedExamples: Flashcard[];
  assignedExamplesCount: number;
  onShowConfirmation: () => void;
  onBack: () => void;
  onBackToEdit: () => void;
  onRestart: () => void;
  isPending: boolean;
  activeStudent: FlashcardStudent | null;
  flashcardDataQuery?: UseQueryResult<StudentFlashcardData | null> | undefined;
  quizExamplesQuery?: UseQueryResult<Flashcard[]> | undefined;
}

export function ExampleAssignmentPanel({
  assignmentType,
  onToggleAssignmentType,
  tableOption,
  onTableOptionChange,
  quizId,
  onQuizIdChange,
  quizList,
  selectedQuizObject,
  exampleSetQuery,
  unassignedExamples,
  onShowConfirmation,
  onBack,
  onBackToEdit,
  onRestart,
  isPending,
  activeStudent,
  flashcardDataQuery,
  quizExamplesQuery,
}: ExampleAssignmentPanelProps) {
  // Get already assigned examples based on assignment type
  const assignedExamples = useMemo<Flashcard[]>(() => {
    if (assignmentType === 'students' && flashcardDataQuery?.data) {
      return flashcardDataQuery.data.examples || [];
    } else if (assignmentType === 'quiz' && quizExamplesQuery?.data) {
      return quizExamplesQuery.data || [];
    }
    return [];
  }, [assignmentType, flashcardDataQuery?.data, quizExamplesQuery?.data]);

  return (
    <div className="assignment-section">
      <h3>Assign Examples</h3>

      <div className="assignment-type-selector">
        <button
          type="button"
          className="toggle-button"
          onClick={onToggleAssignmentType}
        >
          {assignmentType === 'students'
            ? 'Switch to Quiz Assignment'
            : 'Switch to Student Assignment'}
          <span className="toggle-arrow">→</span>
        </button>
      </div>

      {assignmentType === 'students' && (
        <div>
          <p>Select a student to assign these examples to:</p>
          <div className="student-selector">
            <StudentSearch />
          </div>
        </div>
      )}

      {assignmentType === 'quiz' && (
        <div>
          <p>Select a quiz to assign these examples to:</p>
          <div className="quiz-selector">
            <select
              value={tableOption}
              onChange={(e) => onTableOptionChange(e.target.value)}
              className="styledInput"
            >
              <option value="none">Select Course</option>
              {quizCourses.map((course) => (
                <option key={course.code} value={course.code}>
                  {course.name}
                </option>
              ))}
            </select>
            {tableOption !== 'none' && quizList && (
              <select
                value={quizId}
                onChange={(e) => onQuizIdChange(Number(e.target.value))}
                className="styledInput"
              >
                <option value="">Select a Quiz</option>
                {quizList.map((quiz) => (
                  <option key={quiz.recordId} value={quiz.recordId}>
                    {quiz.quizNickname || `Quiz ${quiz.quizNumber}`}
                  </option>
                ))}
              </select>
            )}
          </div>
        </div>
      )}

      {exampleSetQuery.data && exampleSetQuery.data.length > 0 && (
        <>
          <h4>
            Examples to be Assigned ({unassignedExamples.length} remaining)
          </h4>

          {/* First table: Examples available to assign */}
          <ExamplesTable
            dataSource={unassignedExamples}
            displayOrder={unassignedExamples.map((ex: Flashcard) => ({
              recordId: ex.recordId,
            }))}
            studentContext={false}
          />

          {assignmentType === 'students' && (
            <div className="buttonBox">
              <button
                type="button"
                onClick={onShowConfirmation}
                disabled={
                  isPending || unassignedExamples.length === 0 || !activeStudent
                }
              >
                {activeStudent
                  ? `Assign ${unassignedExamples.length} Examples to ${activeStudent.name}`
                  : 'Please select a student first'}
              </button>
            </div>
          )}
          {assignmentType === 'quiz' && selectedQuizObject && (
            <div className="buttonBox">
              <button
                type="button"
                onClick={onShowConfirmation}
                disabled={isPending || unassignedExamples.length === 0}
              >
                {isPending
                  ? 'Assigning...'
                  : `Assign ${unassignedExamples.length} Examples to Quiz: ${
                      selectedQuizObject.quizNickname ||
                      `Quiz ${selectedQuizObject.quizNumber}`
                    }`}
              </button>
            </div>
          )}

          {/* Second table: Already assigned examples */}
          {assignedExamples.length > 0 && (
            <>
              <h4>
                {assignmentType === 'students'
                  ? `Examples Already Assigned to ${activeStudent?.name || 'Student'}`
                  : `Examples Already Assigned to ${
                      selectedQuizObject?.quizNickname ||
                      `Quiz ${selectedQuizObject?.quizNumber}`
                    }`}
                ({assignedExamples.length})
              </h4>
              <ExamplesTable
                dataSource={assignedExamples}
                displayOrder={assignedExamples.map((ex: Flashcard) => ({
                  recordId: ex.recordId,
                }))}
                studentContext={false}
              />
            </>
          )}

          <div className="buttonBox">
            <button type="button" onClick={onBack}>
              Back to Paste
            </button>
            <button type="button" onClick={onBackToEdit}>
              Back to Edit
            </button>
            <button type="button" onClick={onRestart}>
              Restart
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export default ExampleAssignmentPanel;
