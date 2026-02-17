import { useAllQuizGroups } from '@application/queries/useAllQuizGroups';
import { useSearchByQuizFilter } from '@application/units/ExampleSearchInterface/Filters/useSearchByQuizFilter';
import { VocabularyCompleteFilter } from '@interface/components/ExampleSearchInterface/Filters/VocabularyCompleteFilter';
import { GenericDropdown } from '@interface/components/FormComponents';
export interface SearchByQuizProps {
  quizGroupId: number | undefined;
  quizId: number | undefined;
  onQuizGroupIdChange: (value: number | undefined) => void;
  onQuizIdChange: (value: number | undefined) => void;
  vocabularyComplete: boolean | undefined;
  onVocabularyCompleteChange: (value: boolean | undefined) => void;
}

export function SearchByQuiz({
  quizGroupId,
  quizId,
  onQuizGroupIdChange,
  onQuizIdChange,
  vocabularyComplete,
  onVocabularyCompleteChange,
}: SearchByQuizProps) {
  const { quizGroups } = useAllQuizGroups();
  const { quizOptions } = useSearchByQuizFilter({ quizGroupId });

  const handleQuizIdChange = (value: string) => {
    const numValue = Number.parseInt(value);
    if (Number.isNaN(numValue)) {
      onQuizIdChange(undefined);
    } else {
      onQuizIdChange(numValue);
    }
  };
  const handleQuizGroupIdChange = (value: string) => {
    const numValue = Number.parseInt(value);
    if (Number.isNaN(numValue)) {
      onQuizGroupIdChange(undefined);
    } else {
      onQuizGroupIdChange(numValue);
    }
  };

  return (
    <div className="searchByQuizFilterWrapper">
      <GenericDropdown
        label="Course"
        selectedValue={quizGroupId?.toString() || ''}
        onChange={handleQuizGroupIdChange}
        options={
          quizGroups?.map((quizGroup) => ({
            value: quizGroup.id.toString(),
            text: quizGroup.name,
          })) || []
        }
        defaultOptionText="Select a Course"
        editMode
        required
      />

      <GenericDropdown
        label="Quiz"
        selectedValue={quizId?.toString() || ''}
        onChange={handleQuizIdChange}
        options={quizOptions.map((quiz) => ({
          value: quiz.id.toString(),
          text: quiz.quizTitle,
        }))}
        defaultOptionText="Select a Quiz"
        editMode
        required
      />

      <VocabularyCompleteFilter
        value={vocabularyComplete}
        onChange={onVocabularyCompleteChange}
      />
    </div>
  );
}
