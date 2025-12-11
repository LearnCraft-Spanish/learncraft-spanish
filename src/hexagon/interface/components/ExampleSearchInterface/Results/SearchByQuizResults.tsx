import { useSearchByQuizResults } from '@application/units/ExampleSearchInterface/Results/useSearchByQuizResults';
import { BaseResultsComponent } from '@interface/components/ExampleSearchInterface/Results/BaseResultsComponent';

export interface SearchByQuizResultsProps {
  courseCode: string;
  quizNumber: number | undefined;
}
export function SearchByQuizResults({
  courseCode,
  quizNumber,
}: SearchByQuizResultsProps) {
  const { examples, isLoading, error } = useSearchByQuizResults({
    courseCode,
    quizNumber,
  });

  return (
    <BaseResultsComponent
      isLoading={isLoading}
      error={error}
      examples={examples}
    />
  );
}
