interface QuizAssignmentSelectorProps {
  selectedCourseCode: string;
  onCourseCodeChange: (code: string) => void;
  selectedQuizRecordId: number | undefined;
  onQuizRecordIdChange: (id: number | undefined) => void;
  availableQuizzes:
    | Array<{
        recordId: number;
        quizNickname?: string;
        quizNumber?: number;
        courseCode: string;
      }>
    | undefined;
  courseOptions: Array<{ code: string; name: string }>;
}

export function QuizAssignmentSelector({
  selectedCourseCode,
  onCourseCodeChange,
  selectedQuizRecordId,
  onQuizRecordIdChange,
  availableQuizzes,
  courseOptions,
}: QuizAssignmentSelectorProps) {
  return (
    <div>
      <p>Select a quiz to assign these examples to:</p>
      <div className="quiz-selector">
        <select
          value={selectedCourseCode}
          onChange={(e) => {
            onCourseCodeChange(e.target.value);
            onQuizRecordIdChange(undefined);
          }}
          className="styledInput"
        >
          <option value="none">Select Course</option>
          {courseOptions.map((course) => (
            <option key={course.code} value={course.code}>
              {course.name}
            </option>
          ))}
        </select>
        {selectedCourseCode !== 'none' && availableQuizzes && (
          <select
            value={selectedQuizRecordId || ''}
            onChange={(e) =>
              onQuizRecordIdChange(
                e.target.value ? Number(e.target.value) : undefined,
              )
            }
            className="styledInput"
          >
            <option value="">Select a Quiz</option>
            {availableQuizzes.map((quiz) => (
              <option key={quiz.recordId} value={quiz.recordId}>
                {quiz.quizNickname || `Quiz ${quiz.quizNumber}`}
              </option>
            ))}
          </select>
        )}
      </div>
    </div>
  );
}
