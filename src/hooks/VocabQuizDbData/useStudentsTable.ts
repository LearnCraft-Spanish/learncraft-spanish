import { useQuery } from '@tanstack/react-query';
import useVocabQuizDbBackend from './queries/BackendFunctions';

export default function useStudentsTable() {
  const { getStudentsTable } = useVocabQuizDbBackend();

  const studentsTableQuery = useQuery({
    queryKey: ['students-table'],
    queryFn: getStudentsTable,
    staleTime: Infinity,
  });

  return { studentsTableQuery };
}
