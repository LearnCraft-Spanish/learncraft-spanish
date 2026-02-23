import { useOfficialQuizzesQuery } from '@application/queries/useOfficialQuizzesQuery';
import { useSearchByQuizFilter } from '@application/units/ExampleSearchInterface/Filters/useSearchByQuizFilter';
import { VocabularyCompleteFilter } from '@interface/components/ExampleSearchInterface/Filters/VocabularyCompleteFilter';
import { GenericDropdown } from '@interface/components/FormComponents';
import { useMemo } from 'react';
export interface SearchByQuizProps {
  courseCode: string;
  quizNumber: number | '';
  onCourseCodeChange: (value: string) => void;
  onQuizNumberChange: (value: number | '') => void;
  vocabularyComplete: boolean | undefined;
  onVocabularyCompleteChange: (value: boolean | undefined) => void;
}

export function SearchByQuiz({
  courseCode,
  quizNumber,
  onCourseCodeChange,
  onQuizNumberChange,
  vocabularyComplete,
  onVocabularyCompleteChange,
}: SearchByQuizProps) {
  const { quizGroups } = useOfficialQuizzesQuery();
  const { quizOptions } = useSearchByQuizFilter({ courseCode });

  const handleQuizNumberChange = (value: string) => {
    onQuizNumberChange(Number.parseInt(value) || 0);
  };

  const courseOptions = useMemo(() => {
    if (!quizGroups) return [];
    return quizGroups.map((group) => ({
      value: group.urlSlug,
      text: group.name,
    }));
  }, [quizGroups]);

  return (
    <div className="searchByQuizFilterWrapper">
      <GenericDropdown
        label="Course"
        selectedValue={courseCode}
        onChange={onCourseCodeChange}
        options={courseOptions}
        defaultOptionText="Select a Course"
        editMode
        required
      />

      <GenericDropdown
        label="Quiz"
        selectedValue={quizNumber.toString()}
        onChange={handleQuizNumberChange}
        options={quizOptions.map((quiz) => ({
          value: quiz.quizNumber.toString(),
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
