import { useQuery } from '@tanstack/react-query';
import { useProgramAdapter } from '../adapters/programAdapter';

export function usePrograms() {
  const adapter = useProgramAdapter();

  // a feature branch has a real helper function that gives us this. when this is merged in, please update
  const query = `{'3'.GT.'0'}`;

  const programsQuery = useQuery({
    queryKey: ['programs'],
    queryFn: () => adapter.getPrograms(),
  });

  return { programsQuery };
}
