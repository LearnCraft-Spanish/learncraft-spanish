import { useQuery } from '@tanstack/react-query';
import { useBackendHelpers } from 'src/hooks/useBackend';

export interface BundleCredit {
  recordId: number; // record id
  expiration: Date;
  totalCredits: number;
  usedCredits: number;
  creditsRemaining: number;
  expired: boolean;
  relatedStudent: number; // student record id
  studentFullName: string;
  studentActive: boolean;
}

export function useBundleCredits(studentId: number) {
  const { getFactory } = useBackendHelpers();

  const getBundleCreditsForStudent = () =>
    getFactory<BundleCredit[]>(`coaching/bundle-credits/${studentId}`);

  const bundleCreditsQuery = useQuery({
    queryKey: ['bundleCredits', studentId],
    queryFn: getBundleCreditsForStudent,
    enabled: !!studentId,
  });

  return { bundleCreditsQuery };
}
