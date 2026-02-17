import { GenericDropdown } from '@interface/components/FormComponents';
import './QuizAssignmentSelector.scss';
interface QuizAssignmentSelectorProps {
  selectedQuizGroupId: number | undefined;
  onQuizGroupIdChange: (id: number | undefined) => void;
  selectedQuizRecordId: number | undefined;
  onQuizRecordIdChange: (id: number | undefined) => void;
  availableQuizzes:
    | Array<{
        id: number;
        published: boolean;
        quizTitle?: string;
        quizNumber?: number;
        relatedQuizGroupId: number | null;
      }>
    | undefined;
  quizGroupOptions: Array<{ id: number; name: string }>;
}

export function QuizAssignmentSelector({
  selectedQuizGroupId,
  onQuizGroupIdChange,
  selectedQuizRecordId,
  onQuizRecordIdChange,
  availableQuizzes,
  quizGroupOptions,
}: QuizAssignmentSelectorProps) {
  const handleQuizNumberChange = (value: string) => {
    onQuizRecordIdChange(Number.parseInt(value) || undefined);
  };
  const handleQuizGroupIdChange = (value: string) => {
    onQuizGroupIdChange(Number.parseInt(value) || undefined);
  };

  return (
    <div className="quiz-assignment-selector-container">
      <GenericDropdown
        label="Quiz Group"
        selectedValue={selectedQuizGroupId?.toString() || ''}
        onChange={handleQuizGroupIdChange}
        options={quizGroupOptions.map((quizGroupOptions) => ({
          value: quizGroupOptions.id.toString(),
          text: quizGroupOptions.name,
        }))}
        defaultOptionText="Select a Quiz Group"
        editMode
        required
      />

      <GenericDropdown
        label="Quiz"
        selectedValue={selectedQuizRecordId?.toString() || ''}
        onChange={handleQuizNumberChange}
        options={
          availableQuizzes?.map((quiz) => ({
            value: quiz.id.toString(),
            text: quiz.quizTitle || `Quiz ${quiz.quizNumber}`,
          })) || []
        }
        defaultOptionText="Select a Quiz"
        editMode
        required
      />
    </div>
  );
}
