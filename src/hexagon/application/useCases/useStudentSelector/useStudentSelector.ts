import type { AppUserAbbreviation } from '@learncraft-spanish/shared';
import { useActiveStudent } from '@application/coordinators/hooks/useActiveStudent';
import { useUsingAsStudent } from '@application/coordinators/hooks/useUsingAsStudent';
import { useAppStudentList } from '@application/queries/useAppStudentList';
import { useAppUserLookup } from '@application/queries/useAppUserLookup';
import { canUseAsStudent, filterStudentsBySearch } from '@domain/studentAccess';
import { useCallback, useMemo, useState } from 'react';

export interface UseStudentSelectorResult {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  options: AppUserAbbreviation[];
  isListLoading: boolean;
  isUsingAsStudent: boolean;
  /** A picked student's full record is being checked. */
  isSelecting: boolean;
  error: string | null;
  /** Resolves true once the app is being used as that student. */
  selectStudent: (student: AppUserAbbreviation) => Promise<boolean>;
  exitUsingAsStudent: () => void;
  clearError: () => void;
}

/**
 * The coach/admin "Use as student" picker. Same name-or-email search as the
 * legacy sub-header selector, but a pick only sticks if that user is a full
 * student: the list endpoint has no role, so the full record is checked on
 * select.
 */
export function useStudentSelector(): UseStudentSelectorResult {
  const { appStudentList, isLoading: isListLoading } = useAppStudentList();
  const { changeActiveStudent, resetActiveStudent } = useActiveStudent();
  const { isUsingAsStudent, setIsUsingAsStudent } = useUsingAsStudent();
  const { fetchAppUserByEmail } = useAppUserLookup();

  const [searchTerm, setSearchTerm] = useState('');
  const [isSelecting, setIsSelecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const options = useMemo(
    () => filterStudentsBySearch(appStudentList ?? [], searchTerm),
    [appStudentList, searchTerm],
  );

  const selectStudent = useCallback(
    async (student: AppUserAbbreviation): Promise<boolean> => {
      setIsSelecting(true);
      setError(null);
      try {
        const user = await fetchAppUserByEmail(student.emailAddress);
        if (!canUseAsStudent(user)) {
          setError(
            `${student.name || student.emailAddress} doesn't have full student access, so you can't use the app as them.`,
          );
          return false;
        }
        changeActiveStudent(student.emailAddress);
        setIsUsingAsStudent(true);
        setSearchTerm('');
        return true;
      } catch {
        setError("Couldn't load that student. Try again.");
        return false;
      } finally {
        setIsSelecting(false);
      }
    },
    [fetchAppUserByEmail, changeActiveStudent, setIsUsingAsStudent],
  );

  const exitUsingAsStudent = useCallback(() => {
    resetActiveStudent();
    setIsUsingAsStudent(false);
    setSearchTerm('');
    setError(null);
  }, [resetActiveStudent, setIsUsingAsStudent]);

  const clearError = useCallback(() => setError(null), []);

  return {
    searchTerm,
    setSearchTerm,
    options,
    isListLoading,
    isUsingAsStudent,
    isSelecting,
    error,
    selectStudent,
    exitUsingAsStudent,
    clearError,
  };
}
