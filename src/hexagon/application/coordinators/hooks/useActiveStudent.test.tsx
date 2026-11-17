import type { AppUserPort } from '@application/ports/appUserPort';
import type { ReactNode } from 'react';
import { mockAuthAdapter } from '@application/adapters/authAdapter.mock';
import { useActiveStudent } from '@application/coordinators/hooks/useActiveStudent';
import { ActiveStudentProvider } from '@application/coordinators/providers/ActiveStudentProvider';
import { roleHasChangedResponseSchema } from '@learncraft-spanish/shared';
import { act, renderHook, waitFor } from '@testing-library/react';
import { TestQueryClientProvider } from '@testing/providers/TestQueryClientProvider';
import { overrideAuthAndAppUser } from '@testing/utils/overrideAuthAndAppUser';
import {
  getAppUserFromEmail,
  getAuthUserFromEmail,
} from 'mocks/data/serverlike/userTable';
import { beforeEach, describe, expect, it, vi } from 'vitest';

// The global setup mocks this hook for consumers; this suite tests the real one
vi.unmock('@application/coordinators/hooks/useActiveStudent');

const coach = getAppUserFromEmail('student-admin@fake.not')!;
const student = getAppUserFromEmail('student-lcsp@fake.not')!;

const appUserPort: AppUserPort = {
  getMyData: vi.fn(async () => coach),
  getAppUserByEmail: vi.fn(async (email: string) =>
    email === student.emailAddress ? student : null,
  ),
  getAllAppStudents: vi.fn(async () => []),
};

vi.mock('@application/adapters/appUserAdapter', () => ({
  useAppUserAdapter: () => appUserPort,
}));

const { openModal, closeModal } = vi.hoisted(() => ({
  openModal: vi.fn(),
  closeModal: vi.fn(),
}));

vi.mock('@interface/hooks/useModal', () => ({
  useModal: () => ({ openModal, closeModal }),
}));

function wrapper({ children }: { children: ReactNode }) {
  return (
    <TestQueryClientProvider>
      <ActiveStudentProvider>{children}</ActiveStudentProvider>
    </TestQueryClientProvider>
  );
}

describe('useActiveStudent', () => {
  beforeEach(() => {
    overrideAuthAndAppUser({
      authUser: getAuthUserFromEmail('student-admin@fake.not')!,
      isAuthenticated: true,
      isAdmin: true,
      isCoach: true,
      isStudent: true,
    });
  });

  it('defaults to the signed-in user', async () => {
    const { result } = renderHook(() => useActiveStudent(), { wrapper });

    await waitFor(() => expect(result.current.appUser).toEqual(coach));
    expect(result.current.isOwnUser).toBe(true);
  });

  it('switches to a selected student', async () => {
    const { result } = renderHook(() => useActiveStudent(), { wrapper });

    act(() => result.current.changeActiveStudent(student.emailAddress));

    await waitFor(() => expect(result.current.appUser).toEqual(student));
    expect(result.current.isOwnUser).toBe(false);
  });

  it('resetActiveStudent returns to the signed-in user', async () => {
    const { result } = renderHook(() => useActiveStudent(), { wrapper });

    act(() => result.current.changeActiveStudent(student.emailAddress));
    await waitFor(() => expect(result.current.appUser).toEqual(student));

    act(() => result.current.resetActiveStudent());

    await waitFor(() => expect(result.current.appUser).toEqual(coach));
    expect(result.current.isOwnUser).toBe(true);
  });

  it('ignores changes from a user without a coach or admin role', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    overrideAuthAndAppUser({
      authUser: getAuthUserFromEmail('student-lcsp@fake.not')!,
      isAuthenticated: true,
      isStudent: true,
      isAdmin: false,
      isCoach: false,
    });
    const { result } = renderHook(() => useActiveStudent(), { wrapper });

    act(() => result.current.changeActiveStudent('student-ser-estar@fake.not'));

    expect(result.current.isOwnUser).toBe(true);
  });

  it('throws when used outside its provider', () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});

    expect(() => renderHook(() => useActiveStudent())).toThrow(
      'useActiveStudent must be used within an ActiveStudentProvider',
    );
  });

  it('reports loading until the app user has been fetched', async () => {
    const { result } = renderHook(() => useActiveStudent(), { wrapper });

    expect(result.current.isLoading).toBe(true);
    expect(result.current.appUser).toBe(null);

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.appUser).toEqual(coach);
  });
});

describe('useActiveStudent permission to change student', () => {
  const baseAuthUser = getAuthUserFromEmail('student-admin@fake.not')!;

  function signInWithRoles(roles: string[]) {
    overrideAuthAndAppUser({
      authUser: { ...baseAuthUser, roles },
      isAuthenticated: true,
    });
  }

  it.each([
    { roles: ['Coach'] },
    { roles: ['Admin'] },
    { roles: ['Student', 'Coach'] },
    { roles: ['Student', 'Admin'] },
  ])(
    'lets a user with roles $roles switch to another student',
    async ({ roles }) => {
      signInWithRoles(roles);
      const { result } = renderHook(() => useActiveStudent(), { wrapper });

      act(() => result.current.changeActiveStudent(student.emailAddress));

      await waitFor(() => expect(result.current.appUser).toEqual(student));
      expect(result.current.isOwnUser).toBe(false);
    },
  );

  it.each([
    { label: 'Student only', roles: ['Student'] },
    { label: 'Limited only', roles: ['Limited'] },
    { label: 'no recognised role', roles: [''] },
  ])(
    'does not let a user with $label switch to another student',
    async ({ roles }) => {
      vi.spyOn(console, 'error').mockImplementation(() => {});
      signInWithRoles(roles);
      const { result } = renderHook(() => useActiveStudent(), { wrapper });
      await waitFor(() => expect(result.current.appUser).toEqual(coach));

      act(() => result.current.changeActiveStudent(student.emailAddress));

      expect(result.current.isOwnUser).toBe(true);
      expect(result.current.appUser).toEqual(coach);
      expect(appUserPort.getAppUserByEmail).not.toHaveBeenCalled();
    },
  );

  it('does nothing, and does not crash, when nobody is signed in', () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    overrideAuthAndAppUser({ authUser: undefined, isAuthenticated: false });
    const { result } = renderHook(() => useActiveStudent(), { wrapper });

    act(() => result.current.changeActiveStudent(student.emailAddress));

    expect(result.current.appUser).toBe(null);
    expect(appUserPort.getMyData).not.toHaveBeenCalled();
    expect(appUserPort.getAppUserByEmail).not.toHaveBeenCalled();
  });
});

describe('useActiveStudent selection', () => {
  beforeEach(() => {
    overrideAuthAndAppUser({
      authUser: getAuthUserFromEmail('student-admin@fake.not')!,
      isAuthenticated: true,
      isAdmin: true,
      isCoach: true,
    });
  });

  it('rejects a selection that is not a valid email address', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    const { result } = renderHook(() => useActiveStudent(), { wrapper });
    await waitFor(() => expect(result.current.appUser).toEqual(coach));

    act(() => result.current.changeActiveStudent('not-an-email'));

    expect(result.current.isOwnUser).toBe(true);
    expect(result.current.appUser).toEqual(coach);
    expect(appUserPort.getAppUserByEmail).not.toHaveBeenCalled();
  });

  it('shows no student when the selection is cleared to null', async () => {
    const { result } = renderHook(() => useActiveStudent(), { wrapper });
    await waitFor(() => expect(result.current.appUser).toEqual(coach));

    act(() => result.current.changeActiveStudent(null));

    await waitFor(() => expect(result.current.appUser).toBe(null));
  });

  it('surfaces an error when the signed-in user cannot be loaded', async () => {
    vi.mocked(appUserPort.getMyData).mockRejectedValueOnce(
      new Error('profile unavailable'),
    );

    const { result } = renderHook(() => useActiveStudent(), { wrapper });

    await waitFor(() =>
      expect(result.current.error?.message).toBe('profile unavailable'),
    );
    expect(result.current.appUser).toBe(null);
  });
});

describe('useActiveStudent when the access level has changed', () => {
  beforeEach(() => {
    overrideAuthAndAppUser({
      authUser: getAuthUserFromEmail('student-admin@fake.not')!,
      isAuthenticated: true,
      isAdmin: true,
      isCoach: true,
    });
    vi.mocked(appUserPort.getMyData).mockResolvedValueOnce(
      roleHasChangedResponseSchema.value as never,
    );
  });

  it('shows a notice instead of an app user', async () => {
    const { result } = renderHook(() => useActiveStudent(), { wrapper });

    await waitFor(() =>
      expect(openModal).toHaveBeenCalledWith(
        expect.objectContaining({ type: 'notice' }),
      ),
    );
    expect(result.current.appUser).toBe(null);
  });

  it('logs the user out and closes the notice once they confirm it', async () => {
    renderHook(() => useActiveStudent(), { wrapper });
    await waitFor(() => expect(openModal).toHaveBeenCalled());
    const { confirmFunction } = openModal.mock.calls[0][0];

    act(() => confirmFunction());

    await waitFor(() => expect(mockAuthAdapter.logout).toHaveBeenCalled());
    expect(closeModal).toHaveBeenCalled();
  });
});
