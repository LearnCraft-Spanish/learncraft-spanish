import type {
  UseAppHeaderResult,
  UsingAsIdentity,
} from '@application/useCases/AppHeader';
import { useAppHeader } from '@application/useCases/AppHeader';
import { useStudentUiVersion } from '@application/useCases/useStudentUiVersion';
import { useMediaQuery } from '@interface/hooks/useMediaQuery';
import { useMobileStackOverride } from '@interface/hooks/useMobileStackChrome';
import {
  isStudentStackPath,
  stackParentPath,
  stackTitle,
} from '@interface/navigation/studentMobileStack';
import { useLocation, useNavigate } from 'react-router-dom';

export interface AppHeaderStack {
  title: string;
  onBack: () => void;
}

export interface UseAppHeaderViewResult {
  isAuthenticated: boolean;
  isLoading: boolean;
  isSignedIn: boolean;
  studentName: string | undefined;
  studentEmail: string | undefined;
  isStaff: boolean;
  staffRole: 'admin' | 'coach' | null;
  showUseAsStudent: boolean;
  isStaffUsingAsStudent: boolean;
  usingAs: UsingAsIdentity | null;
  stopUsingAsStudent: () => void;
  logout: () => void;
  /** Mobile student-v2 stack chrome. `null` on Home, desktop, and non-student routes. */
  stack: AppHeaderStack | null;
}

/**
 * Visual chrome for `AppHeader`: identity from `useAppHeader`, plus the
 * mobile stack back/title when the student v2 tree is active off Home.
 */
export function useAppHeaderView(): UseAppHeaderViewResult {
  const {
    isAuthenticated,
    isLoading,
    isSignedIn,
    studentName,
    studentEmail,
    isStaff,
    staffRole,
    showUseAsStudent,
    isStaffUsingAsStudent,
    usingAs,
    stopUsingAsStudent,
    logout,
  }: UseAppHeaderResult = useAppHeader();
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const isMobile = useMediaQuery('(max-width: 768px)');
  const { version } = useStudentUiVersion();
  const override = useMobileStackOverride();

  const showStack =
    isMobile && version === 'v2' && isStudentStackPath(pathname);

  const stack: AppHeaderStack | null = showStack
    ? {
        title: override?.title ?? stackTitle(pathname) ?? '',
        onBack:
          override?.onBack ??
          ((): void => {
            navigate(stackParentPath(pathname) ?? '/');
          }),
      }
    : null;

  return {
    isAuthenticated,
    isLoading,
    isSignedIn,
    studentName,
    studentEmail,
    isStaff,
    staffRole,
    showUseAsStudent,
    isStaffUsingAsStudent,
    usingAs,
    stopUsingAsStudent,
    logout,
    stack,
  };
}
