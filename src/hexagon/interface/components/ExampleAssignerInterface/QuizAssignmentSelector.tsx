import { GenericDropdown } from '@interface/components/FormComponents';
import './QuizAssignmentSelector.scss';
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
  const handleQuizNumberChange = (value: string) => {
    onQuizRecordIdChange(Number.parseInt(value) || 0);
  };

  return (
    <div className="quiz-assignment-selector-container">
      <GenericDropdown
        label="Course"
        selectedValue={selectedCourseCode}
        onChange={onCourseCodeChange}
        options={courseOptions.map((course) => ({
          value: course.code,
          text: course.name,
        }))}
        defaultOptionText="Select a Course"
        editMode
        required
      />

      <GenericDropdown
        label="Quiz"
        selectedValue={selectedQuizRecordId?.toString() || ''}
        onChange={handleQuizNumberChange}
        options={
          availableQuizzes?.map((quiz) => ({
            value: quiz.recordId.toString(),
            text: quiz.quizNickname || `Quiz ${quiz.quizNumber}`,
          })) || []
        }
        defaultOptionText="Select a Quiz"
        editMode
        required
      />
    </div>
  );
}
