// used in 1 context (Coaching)
import { useAuthAdapter } from '@application/adapters/authAdapter';
import { useMutation, useQuery } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { useBackend } from 'src/hooks/useBackend';

export interface Subcategory {
  recordId: number;
  subcategoryName: string;
  description?: string;
}

export function useSubcategories() {
  const { isAdmin } = useAuthAdapter();
  const {
    getSubcategoriesFromBackend,
    createSubcategory,
    updateSubcategory,
    deleteSubcategory,
  } = useBackend();

  const subcategoriesQuery = useQuery({
    queryKey: ['subcategories'],
    queryFn: getSubcategoriesFromBackend,
    staleTime: Infinity,
    enabled: isAdmin,
  });

  const createSubcategoryMutation = useMutation({
    mutationFn: (subcategory: Omit<Subcategory, 'recordId'>) => {
      const promise = createSubcategory(subcategory);
      toast.promise(promise, {
        pending: 'Creating subcategory...',
        success: 'Subcategory created!',
        error: 'Error creating subcategory',
      });
      return promise;
    },
    onSettled() {
      subcategoriesQuery.refetch();
    },
  });

  const updateSubcategoryMutation = useMutation({
    mutationFn: (subcategory: Subcategory) => {
      const promise = updateSubcategory(subcategory);
      toast.promise(promise, {
        pending: 'Updating subcategory...',
        success: 'Subcategory updated!',
        error: 'Error updating subcategory',
      });
      return promise;
    },
    onSettled() {
      subcategoriesQuery.refetch();
    },
  });

  const deleteSubcategoryMutation = useMutation({
    mutationFn: (recordId: number) => {
      const promise = deleteSubcategory(recordId);
      toast.promise(promise, {
        pending: 'Deleting subcategory...',
        success: 'Subcategory deleted!',
        error: 'Error deleting subcategory',
      });
      return promise;
    },
    onSettled() {
      subcategoriesQuery.refetch();
    },
  });

  return {
    subcategoriesQuery,
    createSubcategoryMutation,
    updateSubcategoryMutation,
    deleteSubcategoryMutation,
  };
}
