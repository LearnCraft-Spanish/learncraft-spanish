import type {
  AssignmentLookups,
  BaseAssignmentRating,
  BaseAssignmentType,
} from '@learncraft-spanish/shared';
import { useAssignmentsAdapter } from '@application/adapters/assignmentAdapter';
import { useQuery } from '@tanstack/react-query';

interface AssignmentLookupsQueryResult {
  assignmentTypes: BaseAssignmentType[] | undefined;
  assignmentRatings: BaseAssignmentRating[] | undefined;
  isLoading: boolean;
  error: Error | null;
}
export function useAssignmentLookupsQuery(): AssignmentLookupsQueryResult {
  const assignmentsAdapter = useAssignmentsAdapter();
  const { data, isLoading, error } = useQuery<AssignmentLookups>({
    queryKey: ['assignmentLookups'],
    queryFn: () => assignmentsAdapter.getAssignmentLookups(),
  });

  return {
    assignmentTypes: data?.assignmentTypes,
    assignmentRatings: data?.assignmentRatings,
    isLoading,
    error,
  };
}
