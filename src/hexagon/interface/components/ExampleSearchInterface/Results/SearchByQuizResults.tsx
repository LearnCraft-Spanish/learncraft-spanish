import { useOfficialQuizAdapter } from '@application/adapters/officialQuizAdapter';
import { BaseResultsComponent } from '@interface/components/ExampleSearchInterface/Results/BaseResultsComponent';
import { useQuery } from '@tanstack/react-query';

export interface SearchByQuizResultsProps {
  courseCode: string;
  quizNumber: number | undefined;
}
export function SearchByQuizResults({
  courseCode,
  quizNumber,
}: SearchByQuizResultsProps) {
  const { getOfficialQuizExamples } = useOfficialQuizAdapter();
  const {
    data: results,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['examples', 'by quiz', courseCode, quizNumber],
    queryFn: () =>
      getOfficialQuizExamples({ courseCode, quizNumber: quizNumber! }),
    enabled: !!courseCode && !!quizNumber,
  });

  return (
    <BaseResultsComponent
      isLoading={isLoading}
      error={error ?? null}
      examples={results}
    />
  );
}
