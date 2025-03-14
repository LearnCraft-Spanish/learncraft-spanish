import type { UserData } from 'src/types/interfaceDefinitions';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useBackendHelpers } from 'src/hooks/useBackend';
import { useUserData } from 'src/hooks/UserData/useUserData';

export interface BundleCredit {
  recordId: number; // record id
  expiration: number; // datetime as timestamp
  totalCredits: number;
  usedCredits: number;
  creditsRemaining: number;
  expired: boolean;
  relatedStudent: number; // student record id
  studentFullName: string;
  studentActive: boolean;
}

export interface CreateBundleCreditInput {
  relatedStudent: number;
  totalCredits: number;
  usedCredits: number;
  expiration?: string; // datetime as timestamp
}

export interface UpdateBundleCreditInput {
  recordId: number;
  totalCredits?: number;
  usedCredits?: number;
  expiration?: string; // datetime as timestamp
}

export function useBundleCredits(studentId: number) {
  const { getFactory, newPostFactory, newPutFactory, newDeleteFactory } =
    useBackendHelpers();
  const queryClient = useQueryClient();
  const userDataQuery = useUserData();

  const validateAdminAccess = () => {
    const userData = userDataQuery.data as UserData;
    if (!userData || userData.roles.adminRole !== 'admin') {
      throw new Error(
        'Unauthorized: Only administrators can modify bundle credits',
      );
    }
  };

  // Query for fetching bundle credits
  const bundleCreditsQuery = useQuery({
    queryKey: ['bundleCredits', studentId],
    queryFn: async () => {
      const data = await getFactory<BundleCredit[]>(
        `coaching/bundle-credits/${studentId}`,
      );
      return data;
    },
    enabled: !!studentId,
  });

  // Mutation for creating a new bundle credit
  const createBundleCredit = useMutation({
    mutationFn: async (input: CreateBundleCreditInput) => {
      validateAdminAccess();
      return newPostFactory<BundleCredit>({
        path: 'coaching/bundle-credits',
        body: input,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bundleCredits', studentId] });
    },
  });

  // Mutation for updating a bundle credit
  const updateBundleCredit = useMutation({
    mutationFn: async (input: UpdateBundleCreditInput) => {
      validateAdminAccess();
      const { ...updateData } = input;
      return newPutFactory<BundleCredit>({
        path: 'coaching/bundle-credits',
        body: updateData,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bundleCredits', studentId] });
    },
  });

  // Mutation for deleting a bundle credit
  const deleteBundleCredit = useMutation({
    mutationFn: async (bundleId: number) => {
      validateAdminAccess();
      return newDeleteFactory<void>({
        path: `coaching/bundle-credits/${bundleId}`,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bundleCredits', studentId] });
    },
  });

  return {
    bundleCreditsQuery,
    createBundleCredit,
    updateBundleCredit,
    deleteBundleCredit,
  };
}
